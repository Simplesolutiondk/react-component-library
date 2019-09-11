import React, {Component} from 'react';

// Exact match
export const SearchOutputExact = ({item}) => <React.Fragment>
  <h3>Main Suggestion</h3>
  <div className="search-result-exact">
    <strong>{item.title}</strong>
  </div>
</React.Fragment>

// Closest matches
export const SearchOutputClosests = ({items}) => <React.Fragment>
    {Object.keys(items).map((group) => 
        <SearchOutputClosestGroup group={group} items={items[group]}/>
    )}
</React.Fragment>

const SearchOutputClosestGroup = ({group, items}) => <React.Fragment>
  <h3>UNIVERSE: {group}</h3>
  <div className="search-result-exact">
    {items.map(item => <div className="search-result-closests" key={item.id}>{item.title}</div>)}
    <h3>Can't find what you're looking for? Contact us and let us help you</h3>
  </div>
</React.Fragment>