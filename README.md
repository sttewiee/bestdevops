# 🚀 DevOps Lab - Комплексная DevOps Инфраструктура

## 📋 Описание проекта

DevOps Lab - это учебный проект, демонстрирующий полный цикл DevOps практик на одном сервере с возможностью масштабирования до кластера. Проект покрывает все основные инструменты и технологии современного DevOps.

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                    DEVOPS LAB INFRASTRUCTURE                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   GitHub    │  │   GitHub    │  │   GitHub    │        │
│  │   Actions   │  │   Actions   │  │   Actions   │        │
│  │   Runner    │  │   Server    │  │   Workflow  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Docker    │  │ Kubernetes  │  │     K3s     │        │
│  │   Registry  │  │   Cluster   │  │   (Light)   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Prometheus  │  │   Grafana   │  │    ELK      │        │
│  │ Monitoring  │  │  Dashboard  │  │  Logging    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Terraform  │  │   Ansible   │  │   Bash      │        │
│  │     IaC     │  │ Automation  │  │  Scripts    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Цели проекта

- ✅ **CI/CD**: GitHub Actions для автоматизации развертывания
- ✅ **IaC**: Terraform для управления инфраструктурой
- ✅ **Контейнеризация**: Docker и Kubernetes (K3s)
- ✅ **Мониторинг**: Prometheus + Grafana
- ✅ **Логирование**: ELK Stack + Loki
- ✅ **Автоматизация**: Ansible плейбуки
- ✅ **Скриптинг**: Bash скрипты для администрирования

## 📁 Структура проекта

```
devops-lab/
├── README.md                    # Этот файл
├── docs/                        # Документация
├── terraform/                   # Инфраструктура как код
│   ├── vsphere/                 # vSphere ресурсы
│   ├── kubernetes/              # K8s ресурсы
│   └── monitoring/              # Мониторинг ресурсы
├── ansible/                     # Автоматизация
│   ├── playbooks/               # Плейбуки
│   ├── inventory/               # Инвентарь
│   └── roles/                   # Роли
├── kubernetes/                  # K8s манифесты
│   ├── apps/                    # Приложения
│   ├── monitoring/              # Мониторинг
│   └── ci-cd/                   # CI/CD компоненты
├── docker/                      # Docker образы
├── scripts/                     # Bash скрипты
├── ci-cd/                       # CI/CD конфигурации
│   └── github-actions/          # GitHub Actions
└── monitoring/                  # Конфигурации мониторинга
    ├── prometheus/
    ├── grafana/
    └── elk/
```

## 🚀 Быстрый старт

### Предварительные требования

- Ubuntu 24.04 LTS
- vSphere ESXi доступ
- SSH ключи настроены
- Минимум 8GB RAM, 4 CPU, 100GB дискового пространства

### Установка

1. **Клонирование репозитория:**
   ```bash
   git clone <your-repo-url>
   cd devops-lab
   ```

2. **Настройка переменных:**
   ```bash
   cp terraform/vsphere/terraform.tfvars.example terraform/vsphere/terraform.tfvars
   # Отредактируйте файл с вашими параметрами vSphere
   ```

3. **Развертывание инфраструктуры:**
   ```bash
   cd terraform/vsphere
   terraform init
   terraform plan
   terraform apply
   ```

4. **Настройка Kubernetes:**
   ```bash
   cd ../../ansible
   ansible-playbook -i inventory/hosts playbooks/setup-k3s.yml
   ```

5. **Развертывание мониторинга:**
   ```bash
   cd ../kubernetes/monitoring
   kubectl apply -f prometheus/
   kubectl apply -f grafana/
   kubectl apply -f elk/
   ```

## 📚 Учебные материалы

- [Terraform для vSphere](docs/terraform-vsphere.md)
- [Настройка K3s кластера](docs/k3s-setup.md)
- [GitHub Actions CI/CD](docs/github-actions.md)
- [Мониторинг с Prometheus](docs/prometheus-setup.md)
- [Логирование с ELK](docs/elk-setup.md)

## 🔧 Основные компоненты

### 1. Инфраструктура (Terraform)
- Создание VM в vSphere
- Настройка сетей и дисков
- Автоматическое масштабирование

### 2. Контейнеризация (Docker + K3s)
- Легковесный Kubernetes кластер
- Docker Registry для образов
- Helm чарты для приложений

### 3. CI/CD (GitHub Actions)
- Автоматические тесты
- Сборка Docker образов
- Развертывание в Kubernetes

### 4. Мониторинг (Prometheus + Grafana)
- Метрики Kubernetes
- Метрики приложений
- Алерты и уведомления

### 5. Логирование (ELK Stack)
- Централизованное логирование
- Поиск и анализ логов
- Визуализация данных

## 🎓 Образовательные цели

После изучения этого проекта вы сможете:

- Развертывать и управлять Kubernetes кластером
- Автоматизировать инфраструктуру с помощью Terraform
- Настраивать CI/CD пайплайны
- Мониторить и логировать системы
- Применять DevOps практики в реальных проектах

## 🤝 Вклад в проект

Приветствуются pull request'ы и issues! Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](CONTRIBUTING.md) для деталей.

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. [LICENSE](LICENSE) для деталей.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте issue в GitHub
- Обратитесь к документации в папке `docs/`
- Проверьте примеры в папке `examples/`

---

**Удачного изучения DevOps! 🚀**
