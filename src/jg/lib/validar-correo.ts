// Validación de correos en el registro: formato estricto, dominios desechables y errores de tipeo comunes.
const DOMINIOS_DESECHABLES = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'sharklasers.com',
  '10minutemail.com', '10minutemail.net', 'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net',
  'throwawaymail.com', 'yopmail.com', 'yopmail.net', 'yopmail.fr', 'trashmail.com', 'trashmail.net',
  'getnada.com', 'nada.email', 'maildrop.cc', 'dispostable.com', 'fakeinbox.com', 'mailnesia.com',
  'mohmal.com', 'emailondeck.com', 'burnermail.io', 'mintemail.com', 'spamgourmet.com', 'mytemp.email',
  'tempinbox.com', 'moakt.com', 'mail.tm', 'inboxkitten.com', 'discard.email', 'grr.la', 'spam4.me',
  'tmpmail.org', 'tmpmail.net', 'mailcatch.com', 'mvrht.net', 'fakemail.net', 'emailfake.com',
  'example.com', 'example.org', 'example.net', 'test.com', 'prueba.com', 'correo.com', 'email.com',
  'asdf.com', 'aaa.com', 'abc.com', 'xxx.com',
]);

const ERRORES_COMUNES: Record<string, string> = {
  'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com',
  'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gmail.cm': 'gmail.com',
  'hotmial.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotnail.com': 'hotmail.com', 'hotmai.com': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outlook.con': 'outlook.com', 'yahho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com',
  'yaho.com': 'yahoo.com', 'icloud.con': 'icloud.com',
};

const FORMATO = /^[a-z0-9](?:[a-z0-9._%+-]{0,62}[a-z0-9])?@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i;

/** Devuelve un mensaje de error si el correo no parece real, o null si es aceptable. */
export function validarCorreo(correo: string): string | null {
  const email = correo.trim().toLowerCase();
  if (!FORMATO.test(email) || email.includes('..')) {
    return 'Escribe un correo válido, por ejemplo nombre@gmail.com.';
  }
  const dominio = email.split('@')[1] ?? '';
  const sugerido = ERRORES_COMUNES[dominio];
  if (sugerido) return `¿Quisiste decir ${email.split('@')[0]}@${sugerido}? Revisa tu correo.`;
  if (DOMINIOS_DESECHABLES.has(dominio)) {
    return 'Ese correo no es válido para registrarse. Usa tu correo personal o del negocio.';
  }
  return null;
}
