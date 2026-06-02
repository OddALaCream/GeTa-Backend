import { Career } from '../../careers/entities/career.entity';
import { Profile } from '../../profiles/entities/profile.entity';
import { User } from '../../users/entities/user.entity';

export function buildCareerSummary(career?: Career | null) {
  if (!career) {
    return null;
  }

  return {
    id: career.id,
    name: career.name,
    code: career.code,
  };
}

export function buildProfileSummary(profile?: Profile | null) {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    userId: profile.userId,
    fullName: profile.fullName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    campus: profile.campus,
    careerId: profile.careerId,
    career: buildCareerSummary(profile.career),
  };
}

export function buildUserSummary(user?: User | null) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    profile: buildProfileSummary(user.profile),
  };
}
