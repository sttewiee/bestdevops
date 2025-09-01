# vSphere connection variables
variable "vsphere_user" {
  description = "vSphere username"
  type        = string
  sensitive   = true
}

variable "vsphere_password" {
  description = "vSphere password"
  type        = string
  sensitive   = true
}

variable "vsphere_server" {
  description = "vSphere server address"
  type        = string
}

variable "allow_unverified_ssl" {
  description = "Allow unverified SSL certificates"
  type        = bool
  default     = true
}

# vSphere infrastructure variables
variable "datacenter_name" {
  description = "Name of the vSphere datacenter"
  type        = string
}

variable "esxi_host_name" {
  description = "Name of the ESXi host (IP address or hostname)"
  type        = string
}

variable "datastore_name" {
  description = "Name of the vSphere datastore"
  type        = string
}

variable "network_name" {
  description = "Name of the vSphere network"
  type        = string
}

variable "template_name" {
  description = "Name of the VM template to clone from"
  type        = string
}

variable "vm_folder" {
  description = "vSphere folder to place VMs in"
  type        = string
  default     = "DevOps-Lab"
}

# SSH configuration
variable "ssh_public_key" {
  description = "SSH public key for VM access"
  type        = string
}

# Domain configuration
variable "domain_name" {
  description = "Domain name for VMs"
  type        = string
  default     = "devops-lab.local"
}

# Kubernetes configuration
variable "k8s_worker_count" {
  description = "Number of Kubernetes worker nodes"
  type        = number
  default     = 2
}

# Resource sizing variables
variable "management_node_cpu" {
  description = "CPU count for management nodes"
  type        = number
  default     = 2
}

variable "management_node_ram" {
  description = "RAM in MB for management nodes"
  type        = number
  default     = 4096
}

variable "cicd_node_cpu" {
  description = "CPU count for CI/CD nodes"
  type        = number
  default     = 4
}

variable "cicd_node_ram" {
  description = "RAM in MB for CI/CD nodes"
  type        = number
  default     = 4
}

variable "k8s_node_cpu" {
  description = "CPU count for Kubernetes nodes"
  type        = number
  default     = 4
}

variable "k8s_node_ram" {
  description = "RAM in MB for Kubernetes nodes"
  type        = number
  default     = 8192
}
