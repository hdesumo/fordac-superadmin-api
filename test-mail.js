import { sendEmail } from "./src/services/mailService.js";

sendEmail("hdesumo@gmail.com", "Test FORDAC", "<p>✅ Test d’envoi réussi !</p>")
  .then(console.log)
  .catch(console.error);
