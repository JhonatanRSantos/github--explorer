import React, { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

import { Header, Title, Form, Repositories, Error } from './styles';
import logoImage from '../../assets/github_explorer.svg';
import githubApi from '../../services/githubApi';
import { Language } from '../../lang/lang';
import * as english from '../../lang/en';

interface Repository {
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string;
  html_url: string;
}

const Dashboard: React.FC = () => {
  const [language, setLanguage] = useState('en');
  const [translation, setTranslation] = useState<Language>(english);
  const [requestError, setRequestError] = useState('');
  const [repositoryName, setRepositoryName] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const repos = localStorage.getItem('@githubExplorer:repositories');
    if (repos) {
      return JSON.parse(repos);
    }
    return [];
  });

  useEffect(() => {
    import(`../../lang/${language}`).then((lang: Language) => {
      setTranslation(lang);
    });
  }, [language]);

  useEffect(() => {
    localStorage.setItem(
      '@githubExplorer:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  async function handleAddRepository(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (!repositoryName) {
      setRequestError(translation?.repositoryNameError || '');
      return;
    }

    try {
      const { data } = await githubApi.get<Repository>(
        `repos/${repositoryName}`,
      );
      const repoExists = repositories.find(
        repository => repository.owner.login === data.owner.login,
      );

      if (!repoExists) {
        setRepositories([...repositories, data]);
        setRepositoryName('');
        setRequestError('');
      }
    } catch (e) {
      setRequestError(translation?.repositoryNotFound || '');
    }
  }

  function handleLanguageSelection() {
    const selection = document.getElementById(
      'selectLanguage',
    ) as HTMLSelectElement;
    const { value } = selection.options[selection.selectedIndex];
    setLanguage(value);
  }

  return (
    <>
      <Header>
        <img src={logoImage} alt={translation?.logoImageAlt} />
        <select
          id="selectLanguage"
          name="selectLanguage"
          defaultValue="DEFAULT"
          onChange={handleLanguageSelection}
        >
          <option value="DEFAULT" disabled>
            Select a language
          </option>
          <option value="pt">Português</option>
          <option value="en">Enslish</option>
        </select>
      </Header>
      <Title>{translation?.dashboardTitle}</Title>

      <Form hasError={!!requestError} onSubmit={handleAddRepository}>
        <input
          type="text"
          value={repositoryName}
          onChange={event => setRepositoryName(event.target.value)}
          placeholder={translation?.searchPleaceholder}
        />
        <button type="submit">{translation?.searchButton}</button>
      </Form>

      {requestError && <Error>{requestError}</Error>}

      <Repositories>
        {repositories.map(repository => (
          <Link
            key={repository.full_name}
            to={`/repository/${repository.full_name}`}
          >
            <img src={repository.owner.avatar_url} alt={repository.full_name} />
            <div>
              <strong>{repository.full_name}</strong>
              <p>{repository.description}</p>
            </div>
            <FiChevronRight size={20} />
          </Link>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
