use client;

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AiOutlineBook } from 'react-icons/ai';
import { IoIosPeople } from 'react-icons/io';
import { RiVideoLine } from 'react-icons/ri';
import { MdOutlineArticle } from 'react-icons/md';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  url: string;
}

const resources: Resource[] = [
  {
    id: 1,
    title: 'Learn Pal Guide',
    description: 'Get started with Learn Pal',
    type: 'book',
    url: '/guide',
  },
  {
    id: 2,
    title: 'Community Forum',
    description: 'Connect with peers and teachers',
    type: 'people',
    url: '/community',
  },
  {
    id: 3,
    title: 'Video Tutorials',
    description: 'Watch video tutorials on various subjects',
    type: 'video',
    url: '/tutorials',
  },
  {
    id: 4,
    title: 'Blog Articles',
    description: 'Read articles on learning and education',
    type: 'article',
    url: '/blog',
  },
];

const ResourcePage = () => {
  const [filteredResources, setFilteredResources] = useState(resources);

  const handleSearch = (searchTerm: string) => {
    const filteredResources = resources.filter((resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredResources(filteredResources);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-4">Resources</h1>
      <input
        type="search"
        placeholder="Search resources"
        className="w-full p-2 pl-10 text-sm text-gray-700 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        onChange={(e) => handleSearch(e.target.value)}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredResources.map((resource) => (
          <Link key={resource.id} href={resource.url}>
            <div className="bg-white p-4 rounded-md shadow-md">
              <div className="flex items-center mb-2">
                {resource.type === 'book' && <AiOutlineBook size={20} />}
                {resource.type === 'people' && <IoIosPeople size={20} />}
                {resource.type === 'video' && <RiVideoLine size={20} />}
                {resource.type === 'article' && <MdOutlineArticle size={20} />}
                <h2 className="text-lg font-bold ml-2">{resource.title}</h2>
              </div>
              <p className="text-gray-600">{resource.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResourcePage;