export type UserRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "GUEST";
export type TaskStatus = "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELED";
export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW" | "NONE";
export type ProjectStatus = "PLANNING" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "CANCELLED";
export type PresenceStatus = "ONLINE" | "AWAY" | "DND" | "OFFLINE";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  status?: string | null;
  presence: string;
}

export interface WorkspaceWithDetails {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  role?: string;
  membersCount?: number;
  projectsCount?: number;
}

export interface TaskWithDetails {
  id: string;
  workspaceId: string;
  projectId: string;
  sprintId?: string | null;
  identifier: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  creatorId: string;
  dueDate?: string | null;
  startDate?: string | null;
  estimateHours: number;
  trackedSeconds: number;
  position: number;
  createdAt: string;
  updatedAt: string;
  assignee?: SafeUser | null;
  creator?: SafeUser | null;
  project?: {
    id: string;
    name: string;
    identifier: string;
    color: string;
  };
  subtasks?: {
    id: string;
    title: string;
    completed: boolean;
    position: number;
  }[];
  commentsCount?: number;
  githubLinks?: {
    id: string;
    type: "ISSUE" | "PR" | "COMMIT";
    externalId: string;
    title: string;
    url: string;
    status?: string | null;
  }[];
}

export interface ProjectWithDetails {
  id: string;
  workspaceId: string;
  teamId?: string | null;
  name: string;
  identifier: string;
  description?: string | null;
  icon: string;
  color: string;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate?: string | null;
  dueDate?: string | null;
  tasksCount?: number;
  completedTasksCount?: number;
  members?: {
    id: string;
    user: SafeUser;
    role: string;
  }[];
  team?: {
    id: string;
    name: string;
    color: string;
  } | null;
}

export interface DocumentWithDetails {
  id: string;
  workspaceId: string;
  teamId?: string | null;
  parentFolderId?: string | null;
  title: string;
  icon?: string | null;
  coverImage?: string | null;
  content: string;
  isFavorite: boolean;
  isPublished: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: SafeUser;
}

export interface ChannelWithDetails {
  id: string;
  workspaceId: string;
  name: string;
  topic?: string | null;
  isPrivate: boolean;
  type: "CHANNEL" | "DIRECT_MESSAGE";
  unreadCount?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
    sender: {
      name: string;
    };
  };
  members?: {
    user: SafeUser;
  }[];
}

export interface MessageWithSender {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  attachments?: string | null;
  replyToId?: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  sender: SafeUser;
  reactions?: {
    id: string;
    emoji: string;
    userId: string;
    user: { name: string };
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface TimeEntryItem {
  id: string;
  taskId?: string | null;
  description?: string | null;
  durationSeconds: number;
  startTime: string;
  endTime?: string | null;
  isRunning: boolean;
  task?: {
    identifier: string;
    title: string;
    project?: { name: string; color: string };
  };
  user?: SafeUser;
}
