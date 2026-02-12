import os
import sys
import time
import pyautogui
import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from glob import glob

# Delay between actions to visualize steps (seconds). Use --slow or --delay N.
ACTION_DELAY = 0.0
# Dry-run mode: when True, script will only log actions and not perform clicks/uploads
DRY_RUN = False
# When True, prints verbose details in dry-run mode (selectors, timeouts, file list)
DRY_RUN_VERBOSE = False

def set_action_delay_from_args():
    """Lê argumentos de linha de comando para configurar o delay entre ações.

    Também detecta a flag --dry-run para executar em modo de simulação (somente logs).
    """
    global ACTION_DELAY, DRY_RUN, DRY_RUN_VERBOSE
    if "--slow" in sys.argv:
        ACTION_DELAY = 0.8
    elif "--delay" in sys.argv:
        try:
            idx = sys.argv.index("--delay")
            ACTION_DELAY = float(sys.argv[idx+1])
        except Exception:
            ACTION_DELAY = 0.8
    # Process dry-run flags: plain or verbose
    for arg in sys.argv:
        if arg == "--dry-run":
            DRY_RUN = True
            print("--dry-run detectado: executando em modo de simulação (sem cliques nem uploads).")
        elif arg in ("--dry-run=verbose", "--dry-run-verbose"):
            DRY_RUN = True
            DRY_RUN_VERBOSE = True
            print("--dry-run=verbose detectado: modo de simulação com logs detalhados ativado.")
    # Se verbose foi ativado, inicializa relatório
    if DRY_RUN_VERBOSE:
        init_dryrun_log()


def step_pause():
    """Pausa entre ações se ACTION_DELAY > 0."""
    if ACTION_DELAY > 0:
        time.sleep(ACTION_DELAY)


# --- Dry-run verbose logging helpers ---------------------------------
DRYRUN_LOG_PATH = None

def init_dryrun_log():
    """Inicializa o arquivo de relatório na área de trabalho para --dry-run=verbose."""
    global DRYRUN_LOG_PATH
    try:
        ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        desktop = os.path.join(os.path.expanduser('~'), 'Desktop')
        DRYRUN_LOG_PATH = os.path.join(desktop, f'dryrun_report_{ts}.txt')
        with open(DRYRUN_LOG_PATH, 'w', encoding='utf-8') as f:
            f.write(f'DRY-RUN VERBOSE REPORT - {datetime.datetime.now().isoformat()}\n')
            f.write('---\n')
        print(f'--dry-run=verbose: relatório inicializado em {DRYRUN_LOG_PATH}')
    except Exception as e:
        print(f'Falha ao inicializar dryrun log: {e}')


def dryrun_log(msg):
    """Escreve mensagem na stdout e no arquivo de relatório se ativo."""
    print(msg)
    if DRY_RUN_VERBOSE and DRYRUN_LOG_PATH:
        try:
            with open(DRYRUN_LOG_PATH, 'a', encoding='utf-8') as f:
                f.write(msg + '\n')
        except Exception:
            pass

# ----------------------------------------------------------------------


# Uso: python automacao_clipp360.py [chrome|firefox|edge]

def get_driver(browser_name):
    browser_name = browser_name.lower()
    if browser_name == 'firefox':
        return webdriver.Firefox()
    elif browser_name == 'edge':
        return webdriver.Edge()
    else:
        return webdriver.Chrome()


def automacao_login_navegacao():
    browser = sys.argv[1] if len(sys.argv) > 1 else 'chrome'
    # Em modo dry-run não abrimos navegador; apenas simulamos os passos
    if DRY_RUN:
        print(f"[DRY-RUN] Simulando login e navegação no browser: {browser}")
        print("[DRY-RUN] Ir para: https://clipp360.com.br/#/login")
        print("[DRY-RUN] Preencher email e senha")
        print("[DRY-RUN] Navegar: Estoque -> Compras -> Nova Compra -> Importar XML -> Escolher Arquivo")
        xml_folder = os.path.join(os.path.expanduser('~'), 'Desktop', 'xml ricardo')
        xml_files = sorted(glob(os.path.join(xml_folder, '*.xml')))
        print(f"[DRY-RUN] Arquivos XML na pasta '{xml_folder}': {xml_files}")
        if DRY_RUN_VERBOSE:
            print("[DRY-RUN-VERBOSE] Seletores que seriam utilizados:")
            print("  - estoque_btn xpath: //a[normalize-space(text())='Estoque']")
            print("  - compras_btn xpath: //span[normalize-space(text())='Compras']")
            print("  - nova_compra_btn xpath: //span[contains(@class, 'container-button') and contains(text(), 'Nova Compra')]")
            print("  - importar_xml_btn xpath: //span[contains(@class, 'container-button') and contains(text(), 'Importar XML')]")
            print("  - escolher_arquivo_btn xpath: //a[contains(@class, 'dropdown-a') and contains(text(), 'Escolher Arquivo')]")
            print("  - input file xpath: //input[@type='file'] or id='file'")
            print("  - painel de produtos id: importationProducts")
            print("  - esperar_importacao_concluir timeout padrão: 60s")
        print("[DRY-RUN] Irá enviar cada XML para o input[file] e aguardar a importação (sem executar).")
        return None, None

    driver = get_driver(browser)
    driver.get('https://clipp360.com.br/#/login')
    time.sleep(3)
    step_pause()
    email_input = driver.find_element(By.NAME, 'email')
    email_input.clear()
    email_input.send_keys('ricardo.matos22@yahoo.com.br')
    step_pause()
    password_input = driver.find_element(By.NAME, 'password')
    password_input.clear()
    password_input.send_keys('Ricardo1234*')
    step_pause()
    password_input.send_keys(Keys.RETURN)
    time.sleep(5)
    step_pause()
    wait = WebDriverWait(driver, 15)
    estoque_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[normalize-space(text())='Estoque']") ))
    estoque_btn.click()
    step_pause()
    compras_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[normalize-space(text())='Compras']") ))
    compras_btn.click()
    step_pause()
    nova_compra_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(@class, 'container-button') and contains(text(), 'Nova Compra')]")))
    nova_compra_btn.click()
    step_pause()
    importar_xml_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(@class, 'container-button') and contains(text(), 'Importar XML')]")))
    importar_xml_btn.click()
    step_pause()
    escolher_arquivo_btn = wait.until(EC.element_to_be_clickable((By.XPATH, "//a[contains(@class, 'dropdown-a') and contains(text(), 'Escolher Arquivo')]")))
    escolher_arquivo_btn.click()
    step_pause()
    # Envia automaticamente o(s) XML(s) da pasta Desktop/xml ricardo para o input file
    uploaded = importar_xml(driver, wait)
    if not uploaded:
        print("Nenhum XML enviado automaticamente. Abra o diálogo e selecione o arquivo manualmente.")
        input("Após importar o XML manualmente, pressione Enter para continuar...")
    # Aguarda que a importação conclua e que o painel de produtos esteja disponível
    if not esperar_importacao_concluir(driver, wait, timeout=60):
        input("Importação não detectada automaticamente. Verifique o modal e clique em 'Importar' manualmente, depois pressione Enter para continuar...")
    return driver, wait


def clicar_botao_produtos_visual(driver, wait):
    """Localiza e clica no botão 'PRODUTOS' e aguarda o painel `importationProducts` abrir.

    Primeiro tenta localizar o botão pelo atributo `aria-controls='importationProducts'` (mais preciso),
    caso não funcione, tenta por texto e por fallback visual com PyAutoGUI.
    """
    print("Tentando localizar o botão 'PRODUTOS' via atributo aria-controls (Selenium)...")
    try:
        # Primeiro passo: selecionar pelo aria-controls, que corresponde ao painel desejado
        produtos_elem = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@aria-controls='importationProducts'] | //*[contains(@aria-controls,'importationProducts')]")))
        try:
            driver.execute_script("arguments[0].setAttribute('style', arguments[1]);", produtos_elem, "border: 3px solid red; background: yellow;")
        except Exception:
            pass
        step_pause()
        try:
            produtos_elem.click()
        except Exception:
            try:
                driver.execute_script("arguments[0].click();", produtos_elem)
                print("Clique no botão 'PRODUTOS' realizado via JS (fallback).")
            except Exception as e:
                print(f"Falha ao clicar no botão 'PRODUTOS': {e}")
        # Aguarda o painel com id 'importationProducts' ficar visível (abra a janela)
        try:
            wait.until(EC.visibility_of_element_located((By.ID, 'importationProducts')))
            print("Painel 'importationProducts' aberto com sucesso.")
            return
        except Exception:
            print("Clique realizado, mas painel 'importationProducts' não ficou visível imediatamente. Continuando...")
    except Exception as e:
        print(f"Botão específico por aria-controls não encontrado/clicável: {e}; tentando por texto...")

    # Tentativa alternativa: localizar pelo texto 'PRODUTOS' em vários elementos
    print("Tentando localizar o botão 'PRODUTOS' via texto (Selenium)...")
    try:
        xpath = (
            "//button[normalize-space(text())='PRODUTOS'] | //button[normalize-space(text())='Produtos'] |"
            "//span[normalize-space(text())='PRODUTOS'] | //span[normalize-space(text())='Produtos'] |"
            "//a[normalize-space(text())='PRODUTOS'] | //a[normalize-space(text())='Produtos']"
        )
        produtos_elem = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
        try:
            driver.execute_script("arguments[0].setAttribute('style', arguments[1]);", produtos_elem, "border: 3px solid red; background: yellow;")
        except Exception:
            pass
        step_pause()
        try:
            produtos_elem.click()
        except Exception:
            try:
                driver.execute_script("arguments[0].click();", produtos_elem)
                print("Clique no botão 'PRODUTOS' realizado via JS (fallback).")
            except Exception as e:
                print(f"Falha ao clicar no botão 'PRODUTOS' (via texto): {e}")
        try:
            wait.until(EC.visibility_of_element_located((By.ID, 'importationProducts')))
            print("Painel 'importationProducts' aberto com sucesso (via texto).")
            return
        except Exception:
            print("Clique realizado, mas painel 'importationProducts' não ficou visível imediatamente.")
    except Exception as e:
        print(f"Selenium não localizou/clicou pelo texto: {e}; executando fallback visual...")

    # Fallback usando imagem com PyAutoGUI
    print("Aguardando o modal de importação aparecer (visão)...")
    time.sleep(2)
    btn_img_path = os.path.join(os.path.dirname(__file__), 'produtos_btn.png')
    if not os.path.exists(btn_img_path):
        print("Imagem do botão 'PRODUTOS' não encontrada. Salve um screenshot como 'produtos_btn.png'.")
        return
    print("Buscando o botão 'PRODUTOS' na tela por até 20 segundos (sensibilidade 0.7)...")
    found = False
    for i in range(40):
        try:
            location = pyautogui.locateCenterOnScreen(btn_img_path, confidence=0.7)
        except Exception:
            location = pyautogui.locateCenterOnScreen(btn_img_path)
        if location:
            print(f"Botão 'PRODUTOS' encontrado na posição: {location}. Movendo mouse suavemente...")
            import random
            target_x = location[0] + random.randint(-3, 3)
            target_y = location[1] + random.randint(-3, 3)
            pyautogui.moveTo(target_x, target_y, duration=1 + random.random())
            time.sleep(0.2 + random.random() * 0.3)
            step_pause()
            pyautogui.click()
            print("Botão 'PRODUTOS' clicado com PyAutoGUI.")
            found = True
            break
        time.sleep(0.5)
    if not found:
        print("Botão 'PRODUTOS' não encontrado na tela com PyAutoGUI após múltiplas tentativas.")


def esperar_importacao_concluir(driver, wait, timeout=30):
    """Tenta clicar no botão 'Importar' dentro do modal e espera o painel de produtos ficar visível.

    Retorna True se o painel `importationProducts` ficar visível dentro do timeout, senão False.
    """
    print("Aguardando conclusão da importação e aparecimento do modal de produtos...")
    # Tenta clicar no botão 'Importar' dentro do modal, se estiver disponível
    try:
        importar_btn = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.XPATH, "//div[contains(@class,'importationModal')]//button[contains(@class,'btn-success') and normalize-space(.)='Importar']"))
        )
        try:
            importar_btn.click()
            print("Botão 'Importar' clicado.")
        except Exception:
            driver.execute_script("arguments[0].click();", importar_btn)
            print("Botão 'Importar' clicado via JS (fallback).")
    except Exception:
        print("Botão 'Importar' não encontrado/clicável no modal; prosseguindo para aguardar o painel.")

    try:
        wait_long = WebDriverWait(driver, timeout)
        wait_long.until(EC.visibility_of_element_located((By.ID, 'importationProducts')))
        print("Modal 'importationProducts' presente e visível.")
        return True
    except Exception as e:
        print(f"Timeout aguardando modal 'importationProducts': {e}")
        return False


def importar_xml(driver, wait):
    xml_folder = os.path.join(os.path.expanduser('~'), 'Desktop', 'xml ricardo')
    print(f"Buscando arquivos XML na pasta: {xml_folder}")
    xml_files = sorted(glob(os.path.join(xml_folder, '*.xml')))
    print(f"Arquivos encontrados: {xml_files}")
    if not xml_files:
        print("Nenhum arquivo XML encontrado na pasta. Verifique o caminho e o nome dos arquivos.")
        return False
    for xml_file in xml_files:
        print(f'Tentando importar: {xml_file}')
        # Tenta localizar o input file (pode estar oculto)
        try:
            file_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@type='file']")))
        except Exception:
            try:
                file_input = driver.find_element(By.ID, 'file')
            except Exception:
                print("Elemento input[type=file] não encontrado na página.")
                return False
        # Envia o caminho do arquivo; se falhar por estar oculto, torna visível via JS e tenta novamente
        try:
            file_input.send_keys(xml_file)
        except Exception as e:
            try:
                driver.execute_script("arguments[0].style.display='block'; arguments[0].style.visibility='visible';", file_input)
                time.sleep(0.2)
                file_input.send_keys(xml_file)
            except Exception as e2:
                print(f"Falha ao enviar arquivo para input: {e2}")
                return False
        time.sleep(2)
        step_pause()
        try:
            msg = driver.find_element(By.XPATH, "//*[contains(text(), 'xml já importado') or contains(text(), 'XML já importado')]")
            print('XML já importado, tentando próximo arquivo...')
            continue
        except:
            print('XML enviado para a página; aguardando processamento.')
            return True
    return False


def run_robot_tests(tests_path="tests"):
    """Executa testes Robot Framework usando o executável do venv ou python -m robot como fallback."""
    import subprocess, sys, os
    robot_exe = os.path.join(os.path.dirname(sys.executable), "robot")
    if os.name == "nt" and not os.path.exists(robot_exe) and os.path.exists(robot_exe + ".exe"):
        robot_exe = robot_exe + ".exe"
    cmd = [robot_exe, tests_path] if os.path.exists(robot_exe) else [sys.executable, "-m", "robot", tests_path]
    print(f"Executando: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


if __name__ == "__main__":
    try:
        # Lê argumentos para configurar pausas visuais e flags
        set_action_delay_from_args()

        # Suporte a: python automacao_clipp360.py --run-robot [tests_path]
        if "--run-robot" in sys.argv:
            idx = sys.argv.index("--run-robot")
            tests_path = sys.argv[idx+1] if len(sys.argv) > idx+1 and not sys.argv[idx+1].startswith("--") else "tests"
            run_robot_tests(tests_path)
            sys.exit(0)

        # Modo de simulação (apenas logs)
        if DRY_RUN:
            print("Executando em modo DRY-RUN. Nenhuma ação será realizada.")
            # Simulação de fluxo de ações
            browser = sys.argv[1] if len(sys.argv) > 1 else 'chrome'
            print(f"[DRY-RUN] Browser: {browser}")
            print("[DRY-RUN] Ações que seriam executadas:")
            print(" - Login em https://clipp360.com.br/#/login")
            print(" - Navegar: Estoque -> Compras -> Nova Compra -> Importar XML")
            xml_folder = os.path.join(os.path.expanduser('~'), 'Desktop', 'xml ricardo')
            xml_files = sorted(glob(os.path.join(xml_folder, '*.xml')))
            print(f"[DRY-RUN] Arquivos XML encontrados em '{xml_folder}': {xml_files}")
            print("[DRY-RUN] Envio de XMLs para input[type=file] (simulado)")
            print("[DRY-RUN] Aguardar que o modal de importação processe os arquivos e clicar em 'Importar' (simulado)")
            print("[DRY-RUN] Abrir painel 'PRODUTOS' (simulado)")
            if DRY_RUN_VERBOSE:
                print("[DRY-RUN-VERBOSE] Mais detalhes:")
                print("  - Timeout para aguardar o painel de importação: 60s")
                print("  - Seletores esperados:")
                print("    * estoque_btn xpath: //a[normalize-space(text())='Estoque']")
                print("    * compras_btn xpath: //span[normalize-space(text())='Compras']")
                print("    * nova_compra_btn xpath: //span[contains(@class, 'container-button') and contains(text(), 'Nova Compra')]")
                print("    * importar_xml_btn xpath: //span[contains(@class, 'container-button') and contains(text(), 'Importar XML')]")
                print("    * escolher_arquivo_btn xpath: //a[contains(@class, 'dropdown-a') and contains(text(), 'Escolher Arquivo')]")
                print("    * input file xpath: //input[@type='file'] ou id='file'")
            sys.exit(0)

        driver, wait = automacao_login_navegacao()
        clicar_botao_produtos_visual(driver, wait)

        print("Processo finalizado. O navegador permanecerá aberto. Feche manualmente quando desejar.")
        input("Pressione Enter para fechar o navegador...")
    except Exception as e:
        print(f"Erro ao executar a automação: {e}")
        print("O navegador permanecerá aberto para inspeção.")
