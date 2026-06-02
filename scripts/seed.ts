import 'dotenv/config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

type SeedUser = {
  email: string;
  fullName: string;
  careerName: string;
  bio: string;
  avatarUrl: string;
};

type SeedPost = {
  key: string;
  authorEmail: string;
  careerName: string;
  content: string;
  mediaUrl?: string;
};

const SEED_KEY = 'social-demo-v1';
const DEFAULT_PASSWORD = 'Password123!';

const users: SeedUser[] = [
  {
    email: 'lucia.suarez@ucb.edu.bo',
    fullName: 'Lucia Suarez',
    careerName: 'Ingeniería de Sistemas',
    bio: 'Construyo interfaces, tomo cafe y siempre tengo una idea para una hackathon.',
    avatarUrl: 'https://i.pravatar.cc/300?img=32',
  },
  {
    email: 'diego.romero@ucb.edu.bo',
    fullName: 'Diego Romero',
    careerName: 'Ingeniería Civil',
    bio: 'Fan de estructuras, renders y proyectos que cambian la ciudad.',
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
  },
  {
    email: 'sofia.medina@ucb.edu.bo',
    fullName: 'Sofia Medina',
    careerName: 'Comunicación Social',
    bio: 'Me gusta contar historias y cubrir lo que pasa en el campus.',
    avatarUrl: 'https://i.pravatar.cc/300?img=47',
  },
  {
    email: 'matias.arias@ucb.edu.bo',
    fullName: 'Matias Arias',
    careerName: 'Administración de Empresas',
    bio: 'Siempre estoy armando equipos para concursos y ferias de emprendimiento.',
    avatarUrl: 'https://i.pravatar.cc/300?img=15',
  },
  {
    email: 'valentina.rojas@ucb.edu.bo',
    fullName: 'Valentina Rojas',
    careerName: 'Psicología',
    bio: 'Escucho mucho, pregunto bastante y llevo snacks a las reuniones.',
    avatarUrl: 'https://i.pravatar.cc/300?img=21',
  },
];

const posts: SeedPost[] = [
  {
    key: 'post-sistemas-hackathon',
    authorEmail: 'lucia.suarez@ucb.edu.bo',
    careerName: 'Ingeniería de Sistemas',
    content:
      'Acabamos de cerrar una demo del prototipo para la feria de innovación. Si alguien quiere sumarse al backend o al testing, escriban.',
    mediaUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'post-civil-maqueta',
    authorEmail: 'diego.romero@ucb.edu.bo',
    careerName: 'Ingeniería Civil',
    content:
      'Hoy presentamos la maqueta final del puente peatonal. Me sorprendió lo mucho que cambia una propuesta cuando recibes feedback temprano.',
    mediaUrl:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    key: 'post-comunicacion-podcast',
    authorEmail: 'sofia.medina@ucb.edu.bo',
    careerName: 'Comunicación Social',
    content:
      'Estamos grabando un mini podcast con historias del campus. Si tienes una anécdota divertida o inspiradora, te leo.',
  },
  {
    key: 'post-admin-feria',
    authorEmail: 'matias.arias@ucb.edu.bo',
    careerName: 'Administración de Empresas',
    content:
      'Abrimos convocatoria para la feria de emprendimientos del viernes. Buscamos proyectos estudiantiles con ganas de validar su idea en serio.',
  },
  {
    key: 'post-psico-bienestar',
    authorEmail: 'valentina.rojas@ucb.edu.bo',
    careerName: 'Psicología',
    content:
      'Recordatorio amistoso: descansar también es productivo. Si la semana te está pasando por encima, date una pausa y vuelve con más calma.',
  },
];

async function main() {
  const client = new Client(buildClientConfig());
  await client.connect();

  try {
    await client.query('BEGIN');
    await ensureSocialSchema(client);

    const existingRun = await client.query(
      'SELECT 1 FROM "app_seed_runs" WHERE "seedKey" = $1 LIMIT 1',
      [SEED_KEY],
    );

    if (existingRun.rowCount) {
      await client.query('ROLLBACK');
      console.log(`Seed "${SEED_KEY}" ya fue ejecutado anteriormente.`);
      return;
    }

    await ensureCareers(client);

    const careers = await loadCareerMap(client);
    const userIds = await ensureUsers(client, careers);
    const postIds = await ensurePosts(client, careers, userIds);

    await ensureFollows(client, userIds);
    await ensureComments(client, postIds, userIds);
    await ensureLikes(client, postIds, userIds);
    await ensureSavedPosts(client, postIds, userIds);
    await ensureMessages(client, userIds);
    await ensureNotifications(client, userIds);

    await client.query(
      'INSERT INTO "app_seed_runs" ("seedKey") VALUES ($1)',
      [SEED_KEY],
    );

    await client.query('COMMIT');

    console.log('Seed inicial completado correctamente.');
    console.log(`Usuarios de prueba creados con contraseña: ${DEFAULT_PASSWORD}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

function buildClientConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : undefined,
    };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'geta_cato',
    ssl:
      process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: false }
        : undefined,
  };
}

async function ensureSocialSchema(client: Client) {
  const sqlPath = path.resolve(__dirname, '../database/social_features.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await client.query(sql);
}

async function ensureCareers(client: Client) {
  const inserts = [
    ['Ingeniería de Sistemas', 'IS'],
    ['Ingeniería Civil', 'IC'],
    ['Ingeniería Industrial', 'II'],
    ['Administración de Empresas', 'AE'],
    ['Contaduría Pública', 'CP'],
    ['Derecho', 'DR'],
    ['Psicología', 'PS'],
    ['Medicina', 'MD'],
    ['Arquitectura', 'AR'],
    ['Comunicación Social', 'CS'],
  ];

  for (const [name, code] of inserts) {
    await client.query(
      `
        INSERT INTO "careers" ("name", "code")
        VALUES ($1, $2)
        ON CONFLICT ("name") DO NOTHING
      `,
      [name, code],
    );
  }
}

async function loadCareerMap(client: Client) {
  const result = await client.query<{ id: string; name: string }>(
    'SELECT "id", "name" FROM "careers"',
  );

  const careers = new Map<string, string>();

  for (const row of result.rows) {
    careers.set(row.name, row.id);
  }

  return careers;
}

async function ensureUsers(client: Client, careers: Map<string, string>) {
  const ids = new Map<string, string>();

  for (const user of users) {
    const careerId = careers.get(user.careerName);

    if (!careerId) {
      throw new Error(`No se encontró la carrera ${user.careerName}`);
    }

    let userId =
      (
        await client.query<{ id: string }>(
          'SELECT "id" FROM "users" WHERE "email" = $1 LIMIT 1',
          [user.email],
        )
      ).rows[0]?.id || null;

    if (!userId) {
      const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      const insertUser = await client.query<{ id: string }>(
        `
          INSERT INTO "users" ("email", "passwordHash")
          VALUES ($1, $2)
          RETURNING "id"
        `,
        [user.email, passwordHash],
      );

      userId = insertUser.rows[0].id;
    }

    await client.query(
      `
        INSERT INTO "profiles" (
          "userId",
          "fullName",
          "bio",
          "avatarUrl",
          "careerId"
        )
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT ("userId")
        DO UPDATE SET
          "fullName" = EXCLUDED."fullName",
          "bio" = EXCLUDED."bio",
          "avatarUrl" = EXCLUDED."avatarUrl",
          "careerId" = EXCLUDED."careerId",
          "updatedAt" = now()
      `,
      [userId, user.fullName, user.bio, user.avatarUrl, careerId],
    );

    ids.set(user.email, userId);
  }

  return ids;
}

async function ensurePosts(
  client: Client,
  careers: Map<string, string>,
  userIds: Map<string, string>,
) {
  const ids = new Map<string, string>();

  for (const post of posts) {
    const authorId = userIds.get(post.authorEmail);
    const careerId = careers.get(post.careerName);

    if (!authorId || !careerId) {
      throw new Error(`No se pudo resolver el autor o carrera para ${post.key}`);
    }

    let postId =
      (
        await client.query<{ id: string }>(
          `
            SELECT "id"
            FROM "posts"
            WHERE "authorId" = $1 AND "content" = $2
            LIMIT 1
          `,
          [authorId, post.content],
        )
      ).rows[0]?.id || null;

    if (!postId) {
      const insertPost = await client.query<{ id: string }>(
        `
          INSERT INTO "posts" ("authorId", "careerId", "content", "mediaUrl")
          VALUES ($1, $2, $3, $4)
          RETURNING "id"
        `,
        [authorId, careerId, post.content, post.mediaUrl || null],
      );

      postId = insertPost.rows[0].id;
    }

    ids.set(post.key, postId);
  }

  return ids;
}

async function ensureFollows(client: Client, userIds: Map<string, string>) {
  const pairs = [
    ['lucia.suarez@ucb.edu.bo', 'sofia.medina@ucb.edu.bo'],
    ['lucia.suarez@ucb.edu.bo', 'matias.arias@ucb.edu.bo'],
    ['diego.romero@ucb.edu.bo', 'lucia.suarez@ucb.edu.bo'],
    ['sofia.medina@ucb.edu.bo', 'valentina.rojas@ucb.edu.bo'],
    ['matias.arias@ucb.edu.bo', 'lucia.suarez@ucb.edu.bo'],
    ['valentina.rojas@ucb.edu.bo', 'sofia.medina@ucb.edu.bo'],
  ];

  for (const [followerEmail, followingEmail] of pairs) {
    const followerId = userIds.get(followerEmail);
    const followingId = userIds.get(followingEmail);

    if (!followerId || !followingId) {
      continue;
    }

    await client.query(
      `
        INSERT INTO "follows" ("followerId", "followingId")
        VALUES ($1, $2)
        ON CONFLICT ("followerId", "followingId") DO NOTHING
      `,
      [followerId, followingId],
    );
  }
}

async function ensureComments(
  client: Client,
  postIds: Map<string, string>,
  userIds: Map<string, string>,
) {
  const comments = [
    {
      postKey: 'post-sistemas-hackathon',
      authorEmail: 'sofia.medina@ucb.edu.bo',
      content: 'Me interesa cubrir el proyecto cuando salga la versión final. Se ve buenísimo.',
    },
    {
      postKey: 'post-civil-maqueta',
      authorEmail: 'lucia.suarez@ucb.edu.bo',
      content: 'Ese render quedó increíble. Si luego subes más fotos, las guardo para inspiración.',
    },
    {
      postKey: 'post-admin-feria',
      authorEmail: 'valentina.rojas@ucb.edu.bo',
      content: 'Tengo una amiga con un proyecto social. Le voy a pasar la convocatoria.',
    },
    {
      postKey: 'post-psico-bienestar',
      authorEmail: 'matias.arias@ucb.edu.bo',
      content: 'Justo necesitaba leer eso hoy. Gracias por recordarlo.',
    },
  ];

  for (const comment of comments) {
    const postId = postIds.get(comment.postKey);
    const authorId = userIds.get(comment.authorEmail);

    if (!postId || !authorId) {
      continue;
    }

    await client.query(
      `
        INSERT INTO "comments" ("postId", "authorId", "content")
        SELECT $1, $2, $3
        WHERE NOT EXISTS (
          SELECT 1
          FROM "comments"
          WHERE "postId" = $1
            AND "authorId" = $2
            AND "content" = $3
        )
      `,
      [postId, authorId, comment.content],
    );
  }
}

async function ensureLikes(
  client: Client,
  postIds: Map<string, string>,
  userIds: Map<string, string>,
) {
  const likes = [
    ['post-sistemas-hackathon', 'diego.romero@ucb.edu.bo'],
    ['post-sistemas-hackathon', 'sofia.medina@ucb.edu.bo'],
    ['post-civil-maqueta', 'lucia.suarez@ucb.edu.bo'],
    ['post-admin-feria', 'sofia.medina@ucb.edu.bo'],
    ['post-admin-feria', 'valentina.rojas@ucb.edu.bo'],
    ['post-psico-bienestar', 'lucia.suarez@ucb.edu.bo'],
  ];

  for (const [postKey, userEmail] of likes) {
    const postId = postIds.get(postKey);
    const userId = userIds.get(userEmail);

    if (!postId || !userId) {
      continue;
    }

    await client.query(
      `
        INSERT INTO "post_likes" ("postId", "userId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "userId") DO NOTHING
      `,
      [postId, userId],
    );
  }
}

async function ensureSavedPosts(
  client: Client,
  postIds: Map<string, string>,
  userIds: Map<string, string>,
) {
  const saved = [
    ['post-civil-maqueta', 'lucia.suarez@ucb.edu.bo'],
    ['post-sistemas-hackathon', 'matias.arias@ucb.edu.bo'],
    ['post-psico-bienestar', 'sofia.medina@ucb.edu.bo'],
  ];

  for (const [postKey, userEmail] of saved) {
    const postId = postIds.get(postKey);
    const userId = userIds.get(userEmail);

    if (!postId || !userId) {
      continue;
    }

    await client.query(
      `
        INSERT INTO "saved_posts" ("postId", "userId")
        VALUES ($1, $2)
        ON CONFLICT ("postId", "userId") DO NOTHING
      `,
      [postId, userId],
    );
  }
}

async function ensureMessages(client: Client, userIds: Map<string, string>) {
  const messages = [
    {
      senderEmail: 'sofia.medina@ucb.edu.bo',
      recipientEmail: 'lucia.suarez@ucb.edu.bo',
      content: 'Cuando tengas fecha para la demo, avísame y lo cubrimos.',
    },
    {
      senderEmail: 'lucia.suarez@ucb.edu.bo',
      recipientEmail: 'sofia.medina@ucb.edu.bo',
      content: 'Perfecto, mañana te mando el horario y el enlace del prototipo.',
    },
    {
      senderEmail: 'matias.arias@ucb.edu.bo',
      recipientEmail: 'valentina.rojas@ucb.edu.bo',
      content: '¿Te gustaría ayudar con la dinámica de bienestar en la feria?',
    },
  ];

  for (const message of messages) {
    const senderId = userIds.get(message.senderEmail);
    const recipientId = userIds.get(message.recipientEmail);

    if (!senderId || !recipientId) {
      continue;
    }

    await client.query(
      `
        INSERT INTO "messages" ("senderId", "recipientId", "content")
        SELECT $1, $2, $3
        WHERE NOT EXISTS (
          SELECT 1
          FROM "messages"
          WHERE "senderId" = $1
            AND "recipientId" = $2
            AND "content" = $3
        )
      `,
      [senderId, recipientId, message.content],
    );
  }
}

async function ensureNotifications(client: Client, userIds: Map<string, string>) {
  const notifications = [
    {
      recipientEmail: 'lucia.suarez@ucb.edu.bo',
      actorEmail: 'sofia.medina@ucb.edu.bo',
      type: 'message',
      message: 'Sofia Medina te dejó un mensaje nuevo.',
      link: '/home?view=messages',
    },
    {
      recipientEmail: 'matias.arias@ucb.edu.bo',
      actorEmail: 'valentina.rojas@ucb.edu.bo',
      type: 'comment',
      message: 'Valentina Rojas comentó tu publicación sobre la feria.',
      link: '/home?view=feed',
    },
    {
      recipientEmail: 'diego.romero@ucb.edu.bo',
      actorEmail: null,
      type: 'system',
      message: 'Tu perfil ya tiene contenido inicial para que la red se sienta activa.',
      link: '/profile',
    },
  ];

  for (const notification of notifications) {
    const recipientId = userIds.get(notification.recipientEmail);
    const actorId = notification.actorEmail
      ? userIds.get(notification.actorEmail) || null
      : null;

    if (!recipientId) {
      continue;
    }

    await client.query(
      `
        INSERT INTO "notifications" ("recipientId", "actorId", "type", "message", "link")
        SELECT $1, $2, $3, $4, $5
        WHERE NOT EXISTS (
          SELECT 1
          FROM "notifications"
          WHERE "recipientId" = $1
            AND "message" = $4
        )
      `,
      [recipientId, actorId, notification.type, notification.message, notification.link],
    );
  }
}

main().catch((error) => {
  console.error('Error ejecutando seed:', error);
  process.exitCode = 1;
});
