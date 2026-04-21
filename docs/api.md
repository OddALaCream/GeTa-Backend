# API Reference

Base URL: `http://localhost:3000/api`

All protected routes require the header:
```
Authorization: Bearer <access_token>
```

---

## Auth

### POST /auth/register

Register a new UCB student account.

**Body**
```json
{
  "email": "student@ucb.edu.bo",
  "password": "min8chars",
  "fullName": "Juan Pérez",
  "careerId": "uuid"
}
```

**Rules**
- `email` must end with `@ucb.edu.bo`
- `password` minimum 8 characters
- `careerId` must reference an existing career

**Response 201**
```json
{
  "accessToken": "eyJ...",
  "user": {
    "id": "uuid",
    "email": "student@ucb.edu.bo",
    "isActive": true,
    "role": "student",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors**: `400` invalid email domain / validation | `409` email already registered | `404` career not found

---

### POST /auth/login

**Body**
```json
{
  "email": "student@ucb.edu.bo",
  "password": "yourpassword"
}
```

**Response 200**
```json
{
  "accessToken": "eyJ...",
  "user": { ... }
}
```

**Errors**: `401` invalid credentials | `401` inactive account

---

### GET /auth/me _(JWT required)_

Returns the authenticated user with their profile.

**Response 200**
```json
{
  "id": "uuid",
  "email": "...",
  "role": "student",
  "profile": {
    "id": "uuid",
    "fullName": "Juan Pérez",
    "careerId": "uuid",
    "career": { "id": "...", "name": "Ingeniería de Sistemas" },
    "campus": "La Paz",
    "bio": null,
    "avatarUrl": null
  }
}
```

---

## Careers

### GET /careers

Returns all careers ordered by name. Public.

**Response 200**
```json
[
  { "id": "uuid", "name": "Ingeniería de Sistemas", "code": "IS", "createdAt": "...", "updatedAt": "..." }
]
```

---

### GET /careers/:id

**Response 200** – career object  
**Errors**: `404` not found

---

### GET /careers/:id/posts _(JWT required)_

Posts filtered by career, with pagination.

**Query parameters**

| Param    | Type   | Default | Description              |
|----------|--------|---------|--------------------------|
| `page`   | number | 1       | Page number              |
| `limit`  | number | 20      | Items per page (max 100) |

**Response 200**
```json
{
  "data": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

## Users

All routes require JWT.

### GET /users

Returns all users (without passwordHash).

### GET /users/:id

**Errors**: `404` not found

---

## Profiles

### GET /profiles/me _(JWT required)_

Returns the authenticated user's profile with career.

### GET /profiles/:userId

Returns profile for a user by their userId. Public.

**Errors**: `404` not found

### PATCH /profiles/me _(JWT required)_

Update authenticated user's profile.

**Body** (all fields optional)
```json
{
  "fullName": "New Name",
  "bio": "About me",
  "avatarUrl": "https://...",
  "careerId": "uuid"
}
```

**Errors**: `404` career not found

---

## Posts

All routes require JWT.

### POST /posts

Create a new post.

**Body**
```json
{
  "careerId": "uuid",
  "content": "Post content here",
  "mediaUrl": "https://..."
}
```

**Response 201** – created post

**Errors**: `404` career not found

---

### GET /posts

List posts with pagination and optional filters.

**Query parameters**

| Param      | Type   | Default | Description               |
|------------|--------|---------|---------------------------|
| `page`     | number | 1       | Page number               |
| `limit`    | number | 20      | Items per page (max 100)  |
| `careerId` | uuid   | —       | Filter by career          |
| `authorId` | uuid   | —       | Filter by author          |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "content": "...",
      "careerId": "uuid",
      "authorId": "uuid",
      "mediaUrl": null,
      "isDeleted": false,
      "author": { "id": "...", "email": "..." },
      "career": { "id": "...", "name": "..." },
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### GET /posts/:id

**Response 200** – single post with author and career  
**Errors**: `404` not found or deleted

---

### PATCH /posts/:id

Update a post. Only the author can edit.

**Body**
```json
{ "content": "Updated content", "mediaUrl": "https://..." }
```

**Errors**: `404` not found | `403` not the author

---

### DELETE /posts/:id

Soft-delete a post. Only the author can delete.

**Response 200** `{ "message": "Post deleted successfully" }`

**Errors**: `404` not found | `403` not the author

---

## Comments

All routes require JWT.

### POST /comments

**Body**
```json
{
  "postId": "uuid",
  "content": "My comment"
}
```

**Errors**: `404` post not found or deleted

---

### GET /comments/post/:postId

Returns all non-deleted comments for a post, ordered by creation date.

**Response 200** – array of comments with author

---

### PATCH /comments/:id

Update a comment. Only the author can edit.

**Body** `{ "content": "Updated comment" }`

**Errors**: `404` not found | `403` not the author

---

### DELETE /comments/:id

Soft-delete a comment. Only the author can delete.

**Response 200** `{ "message": "Comment deleted successfully" }`

**Errors**: `404` not found | `403` not the author
