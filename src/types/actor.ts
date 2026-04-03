export type PrivilegedActorRole = 'owner' | 'admin';
export type ActorRole = PrivilegedActorRole | 'bot';

export type Actor = {
  id: number;
  role: ActorRole;
};

export type PrivilegedActor = {
  id: number;
  role: PrivilegedActorRole;
};
