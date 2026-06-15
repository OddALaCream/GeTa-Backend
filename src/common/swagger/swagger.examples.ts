import type { OpenAPIObject } from '@nestjs/swagger';

const configuredDemoEmail = process.env.SWAGGER_DEMO_EMAIL?.trim() || '';
const configuredDemoPassword =
  process.env.SWAGGER_DEMO_PASSWORD?.trim() || '';

export const swaggerDemoAccount = {
  email: configuredDemoEmail,
  password: configuredDemoPassword,
};

export const swaggerHasDemoAccount = Boolean(
  configuredDemoEmail && configuredDemoPassword,
);

export const swaggerReferenceNotes = {
  careers:
    'Primero ejecuta GET /api/careers y copia un careerId real. Ejemplo actual en Supabase: Ingenieria de Sistemas -> 2e75860d-3bc6-4392-8ce8-03a961ccfa09.',
  users:
    'Primero ejecuta GET /api/users o GET /api/search?q=... y copia un userId real. Ejemplo actual en Supabase: Frederick Aguirre -> 45af29fa-53c6-4344-8cc6-9d91364896a9.',
  posts:
    'Primero ejecuta GET /api/posts o GET /api/careers/:id/posts y copia un postId real. Ejemplo actual en Supabase: af211c8b-9024-40e1-9859-337f207cb428.',
  comments:
    'Usa el id devuelto por POST /api/comments o uno obtenido desde GET /api/comments/post/:postId. No uses un commentId fijo de ejemplo.',
  notifications:
    'Primero ejecuta GET /api/notifications autenticado como el mismo usuario y copia un notificationId real de esa respuesta.',
  messageRecipient:
    'Primero ejecuta GET /api/users o GET /api/search?q=... y usa un userId real como recipientId. Si la BD remota aun no tiene mensajes, POST /api/messages crea el primero.',
};

export const exampleIds = {
  careerId: '2e75860d-3bc6-4392-8ce8-03a961ccfa09',
  peerCareerId: '63381e0f-d1a0-49a7-a239-df5aaba052c1',
  followingCareerId: 'f383aca2-c730-4f45-80d3-b1ed374cb95b',
  userId: 'a3a1e753-6105-4eb3-82ab-5e7e1067a9ff',
  peerUserId: '45af29fa-53c6-4344-8cc6-9d91364896a9',
  followingUserId: 'b0aa3144-3603-43e3-9414-4286aee5b684',
  profileId: 'a3303d0f-7cf6-4d54-bbb7-c67170b31192',
  peerProfileId: '09a7cbd7-f0f5-4f2c-bfa6-066e8484bfd6',
  followingProfileId: 'e96f932d-dda7-4b53-be76-9d401c88c2ae',
  postId: 'af211c8b-9024-40e1-9859-337f207cb428',
  commentId: '<comment-id-devuelto-por-post-o-get>',
  notificationId: 'af910e00-5b04-4258-ae22-2e3e973c57fe',
  messageId: '<message-id-generado-en-runtime>',
};

export const careerExample = {
  id: exampleIds.careerId,
  name: 'Ingenieria de Sistemas',
  code: 'IS',
  createdAt: '2026-06-09T12:00:00.000Z',
  updatedAt: '2026-06-09T12:00:00.000Z',
};

export const careerSummaryExample = {
  id: exampleIds.careerId,
  name: 'Ingenieria de Sistemas',
  code: 'IS',
};

export const peerCareerSummaryExample = {
  id: exampleIds.peerCareerId,
  name: 'Arquitectura',
  code: 'AR',
};

export const followingCareerSummaryExample = {
  id: exampleIds.followingCareerId,
  name: 'Contaduria Publica',
  code: 'CP',
};

export const profileSummaryExample = {
  id: exampleIds.profileId,
  userId: exampleIds.userId,
  fullName: 'Prueba Swagger',
  bio: null,
  avatarUrl: null,
  campus: 'La Paz',
  careerId: exampleIds.careerId,
  career: careerSummaryExample,
};

export const userSummaryExample = {
  id: exampleIds.userId,
  email: 'prueba.swagger1@ucb.edu.bo',
  role: 'student',
  profile: profileSummaryExample,
};

export const peerProfileSummaryExample = {
  id: exampleIds.peerProfileId,
  userId: exampleIds.peerUserId,
  fullName: 'Frederick Aguirre',
  bio: '',
  avatarUrl:
    'https://pixabay.com/es/photos/perro-retrato-animal-perfil-hocico-707808/',
  campus: 'La Paz',
  careerId: exampleIds.peerCareerId,
  career: peerCareerSummaryExample,
};

export const peerUserSummaryExample = {
  id: exampleIds.peerUserId,
  email: 'frederick.aguirre@ucb.edu.bo',
  role: 'student',
  profile: peerProfileSummaryExample,
};

export const followingProfileSummaryExample = {
  id: exampleIds.followingProfileId,
  userId: exampleIds.followingUserId,
  fullName: 'Ronald Rodriguez',
  bio: null,
  avatarUrl: null,
  campus: 'La Paz',
  careerId: exampleIds.followingCareerId,
  career: followingCareerSummaryExample,
};

export const followingUserSummaryExample = {
  id: exampleIds.followingUserId,
  email: 'ronald@ucb.edu.bo',
  role: 'student',
  profile: followingProfileSummaryExample,
};

export const authUserExample = {
  id: exampleIds.userId,
  email: 'prueba.swagger1@ucb.edu.bo',
  isActive: true,
  role: 'student',
  createdAt: '2026-06-15T22:45:55.757Z',
  updatedAt: '2026-06-15T22:45:55.757Z',
};

export const authMeExample = {
  ...authUserExample,
  profile: profileSummaryExample,
};

export const postCommentExample = {
  id: exampleIds.commentId,
  postId: exampleIds.postId,
  authorId: exampleIds.peerUserId,
  content: 'Yep, this is me',
  createdAt: '2026-06-09T09:54:35.068Z',
  author: peerUserSummaryExample,
};

export const postExample = {
  id: exampleIds.postId,
  authorId: exampleIds.peerUserId,
  careerId: exampleIds.peerCareerId,
  content: '67 days with epstein',
  mediaUrl: null,
  createdAt: '2026-06-09T09:54:13.937Z',
  updatedAt: '2026-06-09T09:54:13.937Z',
  author: peerUserSummaryExample,
  career: peerCareerSummaryExample,
  likesCount: 1,
  commentsCount: 1,
  likedByCurrentUser: false,
  savedByCurrentUser: false,
  comments: [postCommentExample],
  canEdit: true,
  canDelete: true,
};

export const paginatedPostsExample = {
  data: [postExample],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export const followStatsExample = {
  followers: 0,
  following: 1,
};

export const followNetworkExample = {
  followers: [],
  following: [followingUserSummaryExample],
  counts: followStatsExample,
};

export const followSuggestionExample = {
  ...userSummaryExample,
  isFollowing: false,
};

export const notificationExample = {
  id: exampleIds.notificationId,
  type: 'follow',
  message: 'Frederick Aguirre empezo a seguirte',
  link: `/profile/${exampleIds.peerUserId}`,
  isRead: false,
  createdAt: '2026-06-09T10:57:12.409Z',
  actor: peerUserSummaryExample,
};

export const messageExample = {
  id: exampleIds.messageId,
  content: 'Mensaje enviado desde Swagger contra la BD remota.',
  isRead: false,
  createdAt: '<fecha-generada-en-runtime>',
  senderId: exampleIds.userId,
  recipientId: exampleIds.peerUserId,
  sender: userSummaryExample,
  recipient: peerUserSummaryExample,
};

export const conversationSummaryExample = {
  user: peerUserSummaryExample,
  lastMessage: {
    id: exampleIds.messageId,
    content: messageExample.content,
    createdAt: messageExample.createdAt,
    senderId: messageExample.senderId,
    recipientId: messageExample.recipientId,
    isRead: false,
  },
  unreadCount: 0,
};

export const conversationDetailExample = {
  user: peerUserSummaryExample,
  messages: [],
};

export const dashboardOverviewExample = {
  profile: {
    fullName: 'Frederick Aguirre',
    email: 'frederick.aguirre@ucb.edu.bo',
    campus: 'La Paz',
    career: peerCareerSummaryExample,
  },
  metrics: {
    myPosts: 2,
    careerPosts: 2,
    savedPosts: 1,
    unreadNotifications: 0,
    unreadMessages: 0,
    followers: 0,
    following: 1,
    pendingItems: 0,
  },
  highlight: {
    profileCompletion: 67,
    engagementScore: 3,
    focusMessage:
      'Tu perfil puede verse mas solido si completas los elementos pendientes.',
  },
};

export const searchResultsExample = {
  query: 'frederick',
  users: [peerUserSummaryExample],
  careers: [],
  posts: [postExample],
};

export function buildSwaggerDescription() {
  const lines = [
    '# GeTa API',
    '',
    'Documentacion interactiva del backend de GeTa contra la BD remota actual de Supabase.',
    'No depende de `npm run seed` para probar los endpoints principales.',
    '',
  ];

  if (swaggerHasDemoAccount) {
    lines.push(
      '## Cuenta demo opcional configurada',
      '',
      `- Email: \`${swaggerDemoAccount.email}\``,
      `- Password: \`${swaggerDemoAccount.password}\``,
      '- Tambien puedes reemplazarla por cualquier otra cuenta valida de la BD remota.',
      '',
    );
  } else {
    lines.push(
      '## Cuenta para pruebas',
      '',
      '- Usa cualquier cuenta valida que ya exista en la BD remota.',
      '- Si aun no tienes una, registrala desde `POST /api/auth/register` usando un `careerId` real de `GET /api/careers`.',
      '',
    );
  }

  lines.push(
    '## Flujo recomendado de prueba',
    '',
    '1. Ejecuta `GET /api/careers` y copia un `careerId` real.',
    '2. Si no tienes una cuenta valida, registra una nueva con `POST /api/auth/register`.',
    '3. Si ya tienes cuenta, usa `POST /api/auth/login`.',
    '4. Copia el `accessToken` o usa el panel "Acceso rapido" para cargar el Bearer token automaticamente.',
    '5. Antes de enviar `userId`, `postId`, `commentId` o `notificationId`, consulta primero `GET /api/users`, `GET /api/search`, `GET /api/posts`, `GET /api/comments/post/:postId` o `GET /api/notifications` y reutiliza esos IDs reales.',
    '',
    '## Rutas ligadas al frontend',
    '',
    '- `LoginPage` usa `/api/auth/login`.',
    '- `RegisterPage` y `CareerSelectionPage` usan `/api/auth/register` y `/api/careers`.',
    '- `HomePage`, `Feed`, `SearchPanel`, `MessagesPanel`, `NotificationsPanel` y `ProfilePage` consumen el resto de endpoints documentados aqui.',
  );

  return lines.join('\n');
}

export function buildSwaggerCustomJs() {
  const email = JSON.stringify(swaggerDemoAccount.email);
  const password = JSON.stringify(swaggerDemoAccount.password);
  const hasDemoAccount = JSON.stringify(swaggerHasDemoAccount);
  const defaultStatus = JSON.stringify(
    swaggerHasDemoAccount
      ? 'Se detecto una cuenta demo configurada. Puedes usarla o reemplazarla por cualquier cuenta valida de la BD remota.'
      : 'Ingresa cualquier cuenta valida de la BD remota. Si aun no tienes una, registrala primero con POST /api/auth/register usando un careerId real de GET /api/careers.',
  );

  return `
  window.addEventListener('load', function () {
    const defaults = { email: ${email}, password: ${password} };
    const hasDemoAccount = ${hasDemoAccount};
    const defaultStatus = ${defaultStatus};

    function authorizeToken(token) {
      if (window.ui && typeof window.ui.preauthorizeApiKey === 'function') {
        try {
          window.ui.preauthorizeApiKey('bearer', token);
        } catch (error) {
          console.warn('No se pudo preautorizar con preauthorizeApiKey', error);
        }
      }

      if (window.ui && window.ui.authActions) {
        window.ui.authActions.authorize({
          bearer: {
            name: 'bearer',
            schema: {
              type: 'http',
              in: 'header',
              name: 'Authorization',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
            value: token,
          },
        });
      }
    }

    function mountQuickAccess() {
      const infoContainer = document.querySelector('.swagger-ui .information-container.wrapper');

      if (!infoContainer || document.getElementById('geta-swagger-login-panel')) {
        return;
      }

      const panel = document.createElement('section');
      panel.id = 'geta-swagger-login-panel';
      panel.style.cssText = [
        'margin: 24px 0 8px',
        'padding: 18px 20px',
        'border-radius: 14px',
        'border: 1px solid #d7e2f1',
        'background: linear-gradient(135deg, #fffdf3 0%, #f7fbff 100%)',
        'box-shadow: 0 12px 28px rgba(0,0,0,0.08)',
        'font-family: sans-serif',
      ].join(';');

      panel.innerHTML = \`
        <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-end;justify-content:space-between;">
          <div style="flex:1;min-width:260px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#9a7a00;">Acceso rapido</p>
            <h3 style="margin:0 0 8px;font-size:20px;color:#10243a;">Probar endpoints protegidos sin copiar el token a mano</h3>
            <p style="margin:0;color:#38506b;font-size:14px;line-height:1.5;">Ingresa una cuenta valida, inicia sesion y Swagger autorizara automaticamente los endpoints con Bearer token.</p>
            \${hasDemoAccount ? '<p style="margin:8px 0 0;color:#166534;font-size:12px;font-weight:700;">Hay una cuenta demo configurada en variables de entorno.</p>' : ''}
          </div>
          <form id="geta-swagger-login-form" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;min-width:min(100%,520px);flex:1;">
            <input name="email" type="email" placeholder="tu.correo@ucb.edu.bo" value="\${defaults.email}" style="height:42px;padding:0 12px;border:1px solid #c9d6e7;border-radius:10px;" />
            <input name="password" type="password" placeholder="Tu password real" value="\${defaults.password}" style="height:42px;padding:0 12px;border:1px solid #c9d6e7;border-radius:10px;" />
            <button type="submit" style="height:42px;border:none;border-radius:10px;background:#ffd100;color:#10243a;font-weight:800;cursor:pointer;">Iniciar sesion</button>
          </form>
        </div>
        <p id="geta-swagger-login-status" style="margin:12px 0 0;color:#38506b;font-size:13px;">\${defaultStatus}</p>
      \`;

      infoContainer.prepend(panel);

      const form = document.getElementById('geta-swagger-login-form');
      const status = document.getElementById('geta-swagger-login-status');
      const submitButton = form ? form.querySelector('button[type="submit"]') : null;

      if (!form || !status || !submitButton) {
        return;
      }

      form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const emailInput = form.querySelector('input[name="email"]');
        const passwordInput = form.querySelector('input[name="password"]');

        if (!emailInput || !passwordInput) {
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Autorizando...';
        status.textContent = 'Iniciando sesion...';
        status.style.color = '#38506b';

        try {
          const response = await fetch(new URL('/api/auth/login', window.location.origin).toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: emailInput.value,
              password: passwordInput.value,
            }),
          });

          const data = await response.json().catch(function () { return {}; });

          if (!response.ok || !data.accessToken) {
            throw new Error(data.message || 'No se pudo iniciar sesion');
          }

          authorizeToken(data.accessToken);
          status.textContent = 'Sesion iniciada. El token ya se cargo en Swagger para probar endpoints protegidos.';
          status.style.color = '#166534';
        } catch (error) {
          status.textContent = error instanceof Error ? error.message : 'No se pudo autorizar Swagger.';
          status.style.color = '#b42318';
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Iniciar sesion';
        }
      });
    }

    mountQuickAccess();
    const observer = new MutationObserver(mountQuickAccess);
    observer.observe(document.body, { childList: true, subtree: true });
  });
  `;
}

export function addManualSwaggerPaths(document: OpenAPIObject) {
  document.paths['/media/proxy'] = {
    get: {
      tags: ['Media'],
      summary: 'Proxy de imagen remota',
      description:
        'Usado cuando el frontend necesita cargar una imagen remota evitando bloqueos del origen. Ejemplo funcional: la URL se pasa por query `url` y el backend responde con la imagen.',
      parameters: [
        {
          name: 'url',
          in: 'query',
          required: true,
          schema: { type: 'string', format: 'uri' },
          example:
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          description: 'URL remota de la imagen a proxyear.',
        },
      ],
      responses: {
        '200': {
          description: 'Imagen obtenida correctamente desde el origen remoto.',
          content: {
            'image/*': {
              schema: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
        '400': {
          description: 'URL ausente o invalida.',
        },
        '415': {
          description: 'La URL no apunta a una imagen.',
        },
        '502': {
          description: 'No se pudo obtener el recurso remoto.',
        },
      },
    },
  };
}
