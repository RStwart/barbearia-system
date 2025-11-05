const bcrypt = require('bcryptjs');

// Gerar hash para senha "123456"
const senha = '123456';
const saltRounds = 12;

bcrypt.hash(senha, saltRounds, (err, hash) => {
  if (err) {
    console.error('Erro ao gerar hash:', err);
    return;
  }
  
  console.log('Senha original:', senha);
  console.log('Hash gerado:', hash);
  console.log('\nUse este hash no script SQL:');
  console.log(`'${hash}'`);
  
  // Testar se o hash funciona
  bcrypt.compare(senha, hash, (err, result) => {
    if (err) {
      console.error('Erro ao verificar hash:', err);
      return;
    }
    console.log('\nVerificação:', result ? 'SUCESSO' : 'FALHA');
  });
});

console.log('Gerando hash da senha...');