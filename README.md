# transcendence

Para rodar no modo dev e o MinIO funcionar e necessario modificar o `/etc/hosts` e mapear também `127.0.0.1 <- videa.local`, assim sendo possivel acessar pelo navegador

## No Windows
### Abrir o arquivo hosts
#### No Notepad (como administrador):
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
127.0.0.1  videa.local api.videa.local s3.videa.local minio.videa.local
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
127.0.0.1  videa.local api.videa.local s3.videa.local minio.videa.local
```
#### Se necessario limpar o cache DNS

- Linux: sudo systemd-resolve --flush-caches (ou equivalente)
- macOS: sudo dscacheutil -flushcache
- Windows: ipconfig /flushdns

####  Se for rodar o modo prod localmente
```bash
GOOGLE_REDIRECT_URI="http://videa.local"
FRONTEND_ORIGIN="http://videa.local"

VITE_BACKEND_URL="http://api.videa.local"
FRONTEND_SERVER_NAME="videa.local"
BACKEND_SERVER_NAME="api.videa.local"

MINIO_ENDPOINT=minio.videa.local
MINIO_API_ENDPOINT=s3.videa.local
```
E depois edite os servers names no .env