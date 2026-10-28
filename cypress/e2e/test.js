const { Client } = require('ssh2');
const fs = require('fs');
const mysql = require('mysql2/promise');

// Connection settings are read from environment variables (see README).
// No passwords or key paths are stored in the repository.
const sshConfig = {
  host: process.env.SSH_HOST || '127.0.0.1',
  port: Number(process.env.SSH_PORT || 2222),
  username: process.env.SSH_USER || 'vagrant',
  privateKeyPath: process.env.SSH_KEY_PATH,      // path to the private key of the Vagrant VM
};

// MySQL as seen from inside the SSH server
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};


function createSshTunnel(sshConf, dbConf) {
  return new Promise((resolve, reject) => {
    const sshClient = new Client();

    sshClient.on('ready', () => {
      // Пробрасываем порт: локальный порт -> удаленный host:port
      sshClient.forwardOut(
        '127.0.0.1', 
        0, 
        dbConf.host, 
        dbConf.port, 
        (err, stream) => {
          if (err) {
            sshClient.end();
            return reject(err);
          }
          resolve({ stream, sshClient });
        }
      );
    });

    sshClient.on('error', reject);
    const connectOptions = {
      host: sshConf.host,
      port: sshConf.port,
      username: sshConf.username,
      privateKey: fs.readFileSync(sshConf.privateKeyPath),   // read only when a tunnel is actually needed
    };
    sshClient.connect(connectOptions);
  });
}

async function checkOrderNumber(orderNumber) {
  let sshClient;
  let connection;

  try {
    // Поднимаем SSH-туннель
    const tunnel = await createSshTunnel(sshConfig, dbConfig);
    sshClient = tunnel.sshClient;

    connection = await mysql.createConnection({
      ...dbConfig,
      stream: tunnel.stream
    });

    console.log('Успешное подключение к MySQL через SSH!');

    const [rows] = await connection.execute('SELECT * FROM shopauftraege WHERE auftragsnr=?', [orderNumber]);
    console.log('Результат:', rows);

  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    if (connection) await connection.end();
    if (sshClient) sshClient.end();
  }
}
