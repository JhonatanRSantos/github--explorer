import React, { useState, useEffect } from 'react';
import { useRouteMatch, Link } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { Header, RepositoryInfo, Issues } from './styles';
import logoImage from '../../assets/github_explorer.svg';
import githubApi from '../../services/githubApi';
import { Language } from '../../lang/lang';

interface Repository {
  full_name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  html_url: string;
}

interface Issue {
  id: number;
  title: string;
  html_url: string;
  user: {
    login: string;
  };
}

interface RepositoryParams {
  fullName: string;
}

const Repository: React.FC = () => {
  const [translation, setTranslation] = useState<Language | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  const { params } = useRouteMatch<RepositoryParams>();
  useEffect(() => {
    // Set new language
    const language = localStorage.getItem('@githubExplorer:language');
    import(`../../lang/${language}`).then((lang: Language) => {
      setTranslation(lang);
    });
  }, []);

  useEffect(() => {
    (async () => {
      const response = await Promise.all([
        githubApi.get(`repos/${params.fullName}`),
        githubApi.get(`repos/${params.fullName}/issues`),
      ]).catch(e => e.message);
      setRepository(response[0].data);
      setIssues(response[1].data);
    })();
  }, [params.fullName]);

  return (
    <>
      <Header>
        <img src={logoImage} alt="Github Explorer" />
        <Link to="/">
          <FiChevronLeft size={16} />
          {translation?.backButton || 'voltar'}
        </Link>
      </Header>
      {repository && (
        <RepositoryInfo>
          <header>
            <img
              src={repository?.owner.avatar_url}
              alt={repository.owner.login}
            />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
          </header>
          <ul>
            <li>
              <strong>{repository.stargazers_count}</strong>
              <span>Starts</span>
            </li>
            <li>
              <strong>{repository.forks_count}</strong>
              <span>Forks</span>
            </li>
            <li>
              <strong>{repository.open_issues_count}</strong>
              <span>Issues</span>
            </li>
          </ul>
        </RepositoryInfo>
      )}

      <Issues>
        {issues.map(issue => (
          <a key={issue.id} href={issue.html_url}>
            <div>
              <strong>{issue.title}</strong>
              <p>{issue.user.login}</p>
            </div>
            <FiChevronRight size={20} />
          </a>
        ))}
      </Issues>
    </>
  );
};

export default Repository;
