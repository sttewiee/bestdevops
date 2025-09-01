# 🚀 DevOps Lab - Быстрый старт

## ⚡ Что у нас есть

✅ **Ubuntu ISO** скачан (2.7GB)  
✅ **SSH ключи** созданы  
✅ **Terraform** настроен для вашей vSphere  
✅ **Структура проекта** готова  

## 🎯 Что нужно сделать СЕЙЧАС

### **1. Создать Ubuntu шаблон в vSphere (30-60 минут)**

**Откройте vSphere Client:** `https://10.10.1.10/ui/`  
**Логин:** `administrator@vs.local`  
**Пароль:** `5550123aA!@#$`  

**Следуйте инструкции:** `docs/create-ubuntu-template.md`

**Кратко:**
1. Создать VM `ubuntu-template`
2. Установить Ubuntu Server 24.04
3. Настроить cloud-init
4. Преобразовать в шаблон

### **2. Запустить Terraform (5 минут)**

После создания шаблона:

```bash
cd ~/devops-lab/terraform/vsphere
terraform init
terraform plan
terraform apply
```

### **3. Дождаться создания VM (10-15 минут)**

Terraform создаст:
- `mgmt-01` - узел управления
- `runner-01` - CI/CD runner
- `k8s-cp-01` - Kubernetes control plane
- `k8s-worker-01`, `k8s-worker-02` - worker узлы

## 🔧 Что будет дальше

После создания VM:
1. **Настройка K3s** (легкий Kubernetes)
2. **Развертывание мониторинга** (Prometheus + Grafana)
3. **Настройка логирования** (ELK Stack)
4. **Запуск нашего приложения** (DevOps Dashboard)

## 📁 Структура проекта

```
devops-lab/
├── README.md                    # Полное описание
├── QUICKSTART.md               # Эта инструкция
├── docs/                       # Документация
├── terraform/vsphere/          # vSphere инфраструктура
├── scripts/                    # Скрипты
├── ci-cd/github-actions/      # GitHub Actions
├── kubernetes/                 # K8s манифесты
└── monitoring/                 # Мониторинг
```

## ❓ Нужна помощь?

1. **Создание шаблона:** `docs/create-ubuntu-template.md`
2. **Проверка подключения:** `scripts/test-vsphere-connection.sh`
3. **Полная документация:** `README.md`

## 🎉 Результат

После выполнения всех шагов у вас будет:
- **Полноценная DevOps инфраструктура**
- **Kubernetes кластер**
- **Мониторинг и логирование**
- **CI/CD пайплайны**
- **Веб-приложение для администраторов**

---

**Начните с создания Ubuntu шаблона в vSphere! 🚀**
