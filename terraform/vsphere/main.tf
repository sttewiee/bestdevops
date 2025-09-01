terraform {
  required_version = ">= 1.0"

  required_providers {
    vsphere = {
      source  = "vmware/vsphere"
      version = "~> 2.15"
    }
  }
}



# ============
# Провайдер
# ============
provider "vsphere" {
  user                 = var.vsphere_user
  password             = var.vsphere_password
  vsphere_server       = var.vsphere_server
  allow_unverified_ssl = var.allow_unverified_ssl
}

# ============
# Data sources
# ============
data "vsphere_datacenter" "dc" {
  name = var.datacenter_name
}

# Используем ESXi хост вместо кластера
data "vsphere_host" "host" {
  name          = var.esxi_host_name
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_datastore" "datastore" {
  name          = var.datastore_name
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_network" "network" {
  name          = var.network_name
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_virtual_machine" "template" {
  name          = var.template_name
  datacenter_id = data.vsphere_datacenter.dc.id
}

# ============
# Узлы
# ============
locals {
  # Узлы управления
  management_nodes = [
    {
      name = "mgmt-01"
      cpu  = 2
      ram  = 4096
      disk = 50
      tags = ["management", "monitoring"]
    }
  ]

  # Узлы для CI/CD
  cicd_nodes = [
    {
      name = "runner-01"
      cpu  = 4
      ram  = 8192
      disk = 60
      tags = ["cicd", "runner"]
    }
  ]

  # Узлы Kubernetes control plane
  k8s_control_nodes = [
    {
      name = "k8s-cp-01"
      cpu  = 4
      ram  = 8192
      disk = 50
      tags = ["kubernetes", "control-plane"]
    }
  ]

  # Узлы Kubernetes worker
  k8s_worker_nodes = [
    for i in range(var.k8s_worker_count) : {
      name = format("k8s-worker-%02d", i + 1)
      cpu  = 4
      ram  = 8192
      disk = 50
      tags = ["kubernetes", "worker"]
    }
  ]

  # Все узлы
  all_nodes = concat(
    local.management_nodes,
    local.cicd_nodes,
    local.k8s_control_nodes,
    local.k8s_worker_nodes
  )
}

# ============
# ВМ для каждого узла (DHCP для всех)
# ============
resource "vsphere_virtual_machine" "node" {
  for_each = { for node in local.all_nodes : node.name => node }

  name             = each.value.name
  folder           = var.vm_folder
  resource_pool_id = data.vsphere_host.host.resource_pool_id
  host_system_id   = data.vsphere_host.host.id
  datastore_id     = data.vsphere_datastore.datastore.id

  num_cpus = each.value.cpu
  memory   = each.value.ram
  guest_id = data.vsphere_virtual_machine.template.guest_id

  # Сетевой интерфейс. Подключение при включении — наследуется из шаблона.
  network_interface {
    network_id = data.vsphere_network.network.id
    # Не используем extra_config для NIC.
  }

  # Диск. Один основной диск; второй не добавляем.
  disk {
    label            = "disk0"
    size             = each.value.disk
    thin_provisioned = true
  }

  # Клонирование из шаблона с кастомизацией под DHCP
  clone {
    template_uuid = data.vsphere_virtual_machine.template.id

    customize {
      timeout = 30

      linux_options {
        host_name = each.value.name
        domain    = var.domain_name
      }

      # Пустой network_interface означает DHCP.
      network_interface {}
    }
  }

  # Ждем появления сети и IP от VMware Tools (DHCP)
  wait_for_guest_net_timeout = 300
  wait_for_guest_ip_timeout  = 300

  # Теги
  tags = each.value.tags
}

# ============
# Outputs
# ============
output "management_nodes" {
  description = "IP адреса узлов управления"
  value = {
    for node in local.management_nodes :
    node.name => vsphere_virtual_machine.node[node.name].default_ip_address
  }
}

output "cicd_nodes" {
  description = "IP адреса CI/CD узлов"
  value = {
    for node in local.cicd_nodes :
    node.name => vsphere_virtual_machine.node[node.name].default_ip_address
  }
}

output "k8s_control_nodes" {
  description = "IP адреса Kubernetes control plane узлов"
  value = {
    for node in local.k8s_control_nodes :
    node.name => vsphere_virtual_machine.node[node.name].default_ip_address
  }
}

output "k8s_worker_nodes" {
  description = "IP адреса Kubernetes worker узлов"
  value = {
    for node in local.k8s_worker_nodes :
    node.name => vsphere_virtual_machine.node[node.name].default_ip_address
  }
}

output "all_nodes" {
  description = "Все узлы с их IP адресами"
  value = {
    for node in local.all_nodes :
    node.name => {
      ip_address = vsphere_virtual_machine.node[node.name].default_ip_address
      tags       = node.tags
      cpu        = node.cpu
      ram        = node.ram
    }
  }
}
