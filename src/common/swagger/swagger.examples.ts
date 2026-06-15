import type { OpenAPIObject } from '@nestjs/swagger';

export const swaggerDemoAccount = {
  email: process.env.SWAGGER_DEMO_EMAIL || 'lucia.suarez@ucb.edu.bo',
  password: process.env.SWAGGER_DEMO_PASSWORD || 'Password123!',
};

export const exampleIds = {
  careerId: '9bb0f37e-1e30-4df9-bd11-8cf5fe8ef2ab',
  userId: '7a9ad4a2-c0ba-445f-a57f-7925e4f0d52f',
  peerUserId: '2f5bb4a8-932d-4cc6-8e79-fd55de0a67b9',
  profileId: '7ecdf43d-7540-46d2-b5c3-63a2a70cd2f3',
  postId: '4e8bc4c1-a05f-45a6-a5a6-937aab10f1f9',
  commentId: '7740fd73-bf73-409b-9cf0-b7e8ec7de55a',
  notificationId: '99b3f83f-2989-4134-8526-1cc4c7d1ab0f',
  messageId: '12d58a5f-d9d0-4387-b883-120810b922af',
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

export const profileSummaryExample = {
  id: exampleIds.profileId,
  userId: exampleIds.userId,
  fullName: 'Lucia Suarez',
  bio: 'Construyo interfaces, tomo cafe y siempre tengo una idea para una hackathon.',
  avatarUrl: 'https://i.pravatar.cc/300?img=32',
  campus: 'La Paz',
  careerId: exampleIds.careerId,
  career: careerSummaryExample,
};

export const userSummaryExample = {
  id: exampleIds.userId,
  email: swaggerDemoAccount.email,
  role: 'student',
  profile: profileSummaryExample,
};

export const authUserExample = {
  id: exampleIds.userId,
  email: swaggerDemoAccount.email,
  isActive: true,
  role: 'student',
  createdAt: '2026-06-09T12:00:00.000Z',
  updatedAt: '2026-06-09T12:00:00.000Z',
};

export const authMeExample = {
  ...authUserExample,
  profile: profileSummaryExample,
};

export const postCommentExample = {
  id: exampleIds.commentId,
  postId: exampleIds.postId,
  authorId: exampleIds.userId,
  content: 'Me interesa cubrir el proyecto cuando salga la version final.',
  createdAt: '2026-06-09T12:30:00.000Z',
  author: userSummaryExample,
};

export const postExample = {
  id: exampleIds.postId,
  authorId: exampleIds.userId,
  careerId: exampleIds.careerId,
  content:
    'Acabamos de cerrar una demo del prototipo para la feria de innovacion. Si alguien quiere sumarse al backend o al testing, escriban.',
  mediaUrl:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  createdAt: '2026-06-09T12:20:00.000Z',
  updatedAt: '2026-06-09T12:20:00.000Z',
  author: userSummaryExample,
  career: careerSummaryExample,
  likesCount: 2,
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
  followers: 3,
  following: 2,
};

export const followNetworkExample = {
  followers: [
    {
      ...userSummaryExample,
      id: exampleIds.peerUserId,
      email: 'sofia.medina@ucb.edu.bo',
      profile: {
        ...profileSummaryExample,
        id: '7c6ad97b-4ba8-4e0b-ae77-7849b0f0d9c2',
        userId: exampleIds.peerUserId,
        fullName: 'Sofia Medina',
        career: {
          id: '20c7f695-a2e6-4608-8936-9f8488c13770',
          name: 'Comunicacion Social',
          code: 'CS',
        },
      },
    },
  ],
  following: [userSummaryExample],
  counts: followStatsExample,
};

export const followSuggestionExample = {
  ...userSummaryExample,
  id: exampleIds.peerUserId,
  email: 'sofia.medina@ucb.edu.bo',
  profile: {
    ...profileSummaryExample,
    id: '7c6ad97b-4ba8-4e0b-ae77-7849b0f0d9c2',
    userId: exampleIds.peerUserId,
    fullName: 'Sofia Medina',
    career: {
      id: '20c7f695-a2e6-4608-8936-9f8488c13770',
      name: 'Comunicacion Social',
      code: 'CS',
    },
  },
  isFollowing: false,
};

export const notificationExample = {
  id: exampleIds.notificationId,
  type: 'message',
  message: 'Sofia Medina te envio un mensaje',
  link: `/home?view=messages&userId=${exampleIds.peerUserId}`,
  isRead: false,
  createdAt: '2026-06-09T13:00:00.000Z',
  actor: followSuggestionExample,
};

export const conversationSummaryExample = {
  user: followSuggestionExample,
  lastMessage: {
    id: exampleIds.messageId,
    content: 'Cuando tengas fecha para la demo, avisame y lo cubrimos.',
    createdAt: '2026-06-09T13:10:00.000Z',
    senderId: exampleIds.peerUserId,
    recipientId: exampleIds.userId,
    isRead: false,
  },
  unreadCount: 1,
};

export const messageExample = {
  id: exampleIds.messageId,
  content: 'Cuando tengas fecha para la demo, avisame y lo cubrimos.',
  isRead: true,
  createdAt: '2026-06-09T13:10:00.000Z',
  senderId: exampleIds.peerUserId,
  recipientId: exampleIds.userId,
  sender: followSuggestionExample,
  recipient: userSummaryExample,
};

export const conversationDetailExample = {
  user: followSuggestionExample,
  messages: [
    messageExample,
    {
      ...messageExample,
      id: 'a2b3db54-4061-4898-a149-c6d16df2920b',
      content: 'Perfecto, manana te mando el horario y el enlace del prototipo.',
      senderId: exampleIds.userId,
      recipientId: exampleIds.peerUserId,
      sender: userSummaryExample,
      recipient: followSuggestionExample,
    },
  ],
};

export const dashboardOverviewExample = {
  profile: {
    fullName: 'Lucia Suarez',
    email: swaggerDemoAccount.email,
    campus: 'La Paz',
    career: careerSummaryExample,
  },
  metrics: {
    myPosts: 1,
    careerPosts: 5,
    savedPosts: 2,
    unreadNotifications: 1,
    unreadMessages: 1,
    followers: 3,
    following: 2,
    pendingItems: 2,
  },
  highlight: {
    profileCompletion: 100,
    engagementScore: 6,
    focusMessage:
      'Tienes conversaciones pendientes. Responder rapido mejora la interaccion.',
  },
};

export const searchResultsExample = {
  query: 'lucia',
  users: [followSuggestionExample],
  careers: [careerSummaryExample],
  posts: [postExample],
};

export function buildSwaggerDescription() {
  return [
    '# GeTa API',
    '',
    'Documentacion interactiva del backend de GeTa.',
    '',
    '## Cuenta de prueba para Swagger',
    '',
    `- Email: \`${swaggerDemoAccount.email}\``,
    `- Password: \`${swaggerDemoAccount.password}\``,
    '- Si aun no existe la cuenta, ejecuta `npm run seed` en el backend.',
    '',
    '## Flujo recomendado de prueba',
    '',
    '1. Usa el panel "Acceso rapido" al inicio de Swagger o prueba `POST /auth/login`.',
    '2. Swagger cargara el token automaticamente para los endpoints protegidos.',
    '3. Para endpoints con `careerId`, `userId` o `postId`, primero consulta `/careers`, `/users`, `/posts` o `/profiles/me` y reutiliza esos IDs reales.',
    '',
    '## Rutas ligadas al frontend',
    '',
    '- `LoginPage` usa `/auth/login`.',
    '- `RegisterPage` y `CareerSelectionPage` usan `/auth/register` y `/careers`.',
    '- `HomePage`, `Feed`, `SearchPanel`, `MessagesPanel`, `NotificationsPanel` y `ProfilePage` consumen el resto de endpoints documentados aqui.',
  ].join('\n');
}

export function buildSwaggerCustomJs() {
  const email = JSON.stringify(swaggerDemoAccount.email);
  const password = JSON.stringify(swaggerDemoAccount.password);

  return `
  window.addEventListener('load', function () {
    const defaults = { email: ${email}, password: ${password} };

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
          </div>
          <form id="geta-swagger-login-form" style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;min-width:min(100%,520px);flex:1;">
            <input name="email" type="email" placeholder="tu.correo@ucb.edu.bo" value="\${defaults.email}" style="height:42px;padding:0 12px;border:1px solid #c9d6e7;border-radius:10px;" />
            <input name="password" type="password" placeholder="Contrasena" value="\${defaults.password}" style="height:42px;padding:0 12px;border:1px solid #c9d6e7;border-radius:10px;" />
            <button type="submit" style="height:42px;border:none;border-radius:10px;background:#ffd100;color:#10243a;font-weight:800;cursor:pointer;">Iniciar sesion</button>
          </form>
        </div>
        <p id="geta-swagger-login-status" style="margin:12px 0 0;color:#38506b;font-size:13px;">Puedes usar la cuenta seed por defecto o reemplazarla por otra cuenta real.</p>
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
