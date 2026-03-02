import { renderInternalLayout } from '../components/layout.js';

const providers = ['Google', 'Apple', 'Facebook', 'Correo', 'Teléfono'];

export const renderAuthLogin = () => renderInternalLayout('Iniciar sesión', `<div class="grid gap-2">${providers.map((p) => `<button data-provider="${p}" class="auth-social">Continuar con ${p}</button>`).join('')}</div><p class="mt-4 text-sm">¿No tienes cuenta? <a class="text-uiBlue font-semibold" href="#/auth/register">Crear cuenta</a></p>`);
