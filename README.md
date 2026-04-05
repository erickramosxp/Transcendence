# transcendence

Para rodar no modo dev e o MinIO funcionar e necessario modificar o `/etc/hosts` e mapear também `127.0.0.1 <- minio-dev`, assim sendo possivel acessar pelo navegador http://minio-dev:9000

## No Windows
### Abrir o arquivo hosts
#### No Notepad:
- File → Open
- navegar até:
```bash
C:\Windows\System32\drivers\etc\
```
- mudar o filtro de:
```bash
Text Documents (*.txt)
```
- para:
```bash
All Files (*.*)
```
- abrir o arquivo:
```bash
hosts
```
- Adicionar no final do arquivo:
```bash
127.0.0.1   minio-dev
```
## No Linux

- navegar até:
```bash
/etc/hosts
```
- abrir o arquivo:
```bash
hosts
```
- Adicionar no arquivo:
```bash
127.0.0.1   minio-dev
```
- se for rodar o modo prod localmente
```bash
127.0.0.1   frontend.local
127.0.0.1   backend.local
127.0.0.1   minio.local
```
E depois edite os servers names no .env