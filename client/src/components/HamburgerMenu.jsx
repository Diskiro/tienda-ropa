import React, { useState } from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  position: relative;
  display: none;
  
  @media (max-width: 600px) {
    display: block;
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuIcon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  
  span {
    display: block;
    width: 100%;
    height: 2px;
    background-color: #333;
    transition: all 0.3s ease;
  }
`;

const MenuList = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: white;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  padding: 1rem;
  z-index: 1000;
  overflow-y: auto;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 2rem;
`;

const CategoryItem = styled.li`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  a {
    text-decoration: none;
    color: #333;
    font-size: 1.1rem;
    display: block;
  }
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const HamburgerMenu = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <MenuContainer>
      <MenuButton onClick={toggleMenu} aria-label="Toggle menu">
        <MenuIcon>
          <span></span>
          <span></span>
          <span></span>
        </MenuIcon>
      </MenuButton>
      
      <MenuList isOpen={isOpen}>
        <CloseButton onClick={toggleMenu}>&times;</CloseButton>
        <CategoryList>
          {categories.map((category) => (
            <CategoryItem key={category.id}>
              <a href={`/category/${category.slug}`} onClick={toggleMenu}>
                {category.name}
              </a>
            </CategoryItem>
          ))}
        </CategoryList>
      </MenuList>
    </MenuContainer>
  );
};

export default HamburgerMenu; 
 
 
 
 
 