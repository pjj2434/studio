'use client';

import { useState, useEffect } from 'react';

import { ArticleType } from '../types';
import Header from '@/components/main/Header';
import Main from '@/components/main/Main';
import Footer from '@/components/main/Footer';

export default function HomePage() {
  const [isArticleVisible, setIsArticleVisible] = useState(false);
  const [timeout, setTimeoutState] = useState(false);
  const [articleTimeout, setArticleTimeout] = useState(false);
  const [article, setArticle] = useState<ArticleType>('');
  const [loading, setLoading] = useState('is-loading');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading('');
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleOpenArticle = (newArticle: ArticleType) => {
    setIsArticleVisible(!isArticleVisible);
    setArticle(newArticle);

    setTimeout(() => {
      setTimeoutState(!timeout);
    }, 325);

    setTimeout(() => {
      setArticleTimeout(!articleTimeout);
    }, 350);
  };

  const handleCloseArticle = () => {
    setArticleTimeout(!articleTimeout);

    setTimeout(() => {
      setTimeoutState(!timeout);
    }, 325);

    setTimeout(() => {
      setIsArticleVisible(!isArticleVisible);
      setArticle('');
    }, 350);
  };

  return (
    <div className={`body ${loading} ${isArticleVisible ? 'is-article-visible' : ''}`}>
      <div className="bg" />
      
      <div className="wrapper">
        <Header onOpenArticle={handleOpenArticle} timeout={timeout} />
        <Main
          isArticleVisible={isArticleVisible}
          timeout={timeout}
          articleTimeout={articleTimeout}
          article={article}
          onCloseArticle={handleCloseArticle}
        />
        <Footer timeout={timeout} />
      </div>
    </div>
  );
}