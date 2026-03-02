import { renderInternalLayout } from '../components/layout.js';

const providers = ['Google', 'Apple', 'Facebook', 'Correo', 'Teléfono'];

export const renderAuthRegister = () => renderInternalLayout('Crear cuenta', `<div class="grid gap-2">${providers.map((p) => `<button data-provider="${p}" class="auth-social">Registrarme con ${p}</button>`).join('')}</div><p class="mt-4 text-sm">¿Ya tienes cuenta? <a class="text-uiBlue font-semibold" href="#/auth/login">Iniciar sesión</a></p>`);
