// types/index.ts
export interface Package {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  duration: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}
export type ArticleType = 'intro' | 'work' | 'about' | 'contact' | '';

export interface HeaderProps {
  onOpenArticle: (article: ArticleType) => void;
  timeout: boolean;
}

export interface MainProps {
  isArticleVisible: boolean;
  timeout: boolean;
  articleTimeout: boolean;
  article: ArticleType;
  onCloseArticle: () => void;
}

export interface FooterProps {
  timeout: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}
