const { defineConfig } = require('cypress')
const { Client } = require('ssh2')
const mysql = require('mysql2/promise')

// 1. Конфигурация SSH-сервера
const sshConfig = {
  host: '127.0.0.1',
  port: 2222,
  username: 'vagrant',
  // password: 'ssh_password',
  privateKey: require('fs').readFileSync('C:/PRO/box/.vagrant/machines/default/virtualbox/private_key') 
};

// 2. Конфигурация MySQL (как ее видит SSH-сервер)
const dbConfig = {
  host: '127.0.0.1', // Обычно 127.0.0.1, если БД на том же сервере, что и SSH
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'cs_std131001'
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
    sshClient.connect(sshConf);
  });
}

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      
      on('task', {

        sumNumbers(params) {
          return params.a + params.b
        },

        async checkOrderNumber(orderNumber) {
          let sshClient;
          let connection;
          let row;
        
          try {
            // Поднимаем SSH-туннель
            const tunnel = await createSshTunnel(sshConfig, dbConfig);
            sshClient = tunnel.sshClient;
        
            connection = await mysql.createConnection({
              ...dbConfig,
              stream: tunnel.stream
            });
        
            row = await connection.execute('SELECT * FROM shopauftraege WHERE auftragsnr=?', [orderNumber]);
        
          } catch (error) {
            
          } finally {
            if (connection) await connection.end();
            if (sshClient) sshClient.end();
          }

          if (row) {
            return row[0][0];
          }
          else {
            return null;
          }
        }

      });
      
    },

  },

});
