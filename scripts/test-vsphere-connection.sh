#!/bin/bash

# Скрипт для проверки подключения к vSphere
# Использование: ./test-vsphere-connection.sh

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Проверка подключения к vSphere...${NC}"
echo "=================================="

# Проверка наличия Terraform
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform не установлен${NC}"
    echo "Установите Terraform: sudo snap install terraform --classic"
    exit 1
else
    echo -e "${GREEN}✅ Terraform установлен: $(terraform version)${NC}"
fi

# Проверка наличия vSphere провайдера
if [ ! -f "terraform/vsphere/.terraform.lock.hcl" ]; then
    echo -e "${YELLOW}⚠️  Terraform не инициализирован${NC}"
    echo "Перейдите в папку terraform/vsphere и выполните: terraform init"
    exit 1
else
    echo -e "${GREEN}✅ Terraform инициализирован${NC}"
fi

# Проверка подключения к vSphere
echo -e "${BLUE}🌐 Проверка подключения к vSphere серверу...${NC}"

# Проверка доступности сервера
if ping -c 1 10.10.1.10 &> /dev/null; then
    echo -e "${GREEN}✅ vSphere сервер 10.10.1.10 доступен${NC}"
else
    echo -e "${RED}❌ vSphere сервер 10.10.1.10 недоступен${NC}"
    exit 1
fi

# Проверка ESXi хоста
if ping -c 1 10.10.1.1 &> /dev/null; then
    echo -e "${GREEN}✅ ESXi хост 10.10.1.1 доступен${NC}"
else
    echo -e "${RED}❌ ESXi хост 10.10.1.1 недоступен${NC}"
    exit 1
fi

# Проверка конфигурации Terraform
echo -e "${BLUE}📋 Проверка конфигурации Terraform...${NC}"

cd terraform/vsphere

# Проверка синтаксиса
if terraform validate; then
    echo -e "${GREEN}✅ Конфигурация Terraform корректна${NC}"
else
    echo -e "${RED}❌ Ошибки в конфигурации Terraform${NC}"
    exit 1
fi

# Проверка плана
echo -e "${BLUE}📊 Проверка плана развертывания...${NC}"

if terraform plan -out=tfplan; then
    echo -e "${GREEN}✅ План развертывания создан успешно${NC}"
    echo -e "${YELLOW}📝 План сохранен в файл tfplan${NC}"
    echo -e "${BLUE}💡 Для применения выполните: terraform apply tfplan${NC}"
else
    echo -e "${RED}❌ Ошибка при создании плана развертывания${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Все проверки пройдены успешно!${NC}"
echo "=================================="
echo -e "${BLUE}📚 Следующие шаги:${NC}"
echo "1. Создайте Ubuntu шаблон в vSphere (см. docs/create-ubuntu-template.md)"
echo "2. После создания шаблона выполните: terraform apply tfplan"
echo "3. Дождитесь создания всех VM"
echo "4. Настройте Kubernetes и мониторинг"

cd ../..
