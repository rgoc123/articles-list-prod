import React, { Component } from 'react';
import './App.css';
import articles from './data/articles';
import ArticleRow from './components/articleRow';

class App extends Component {

  constructor() {
    super();
    this.state = {
      articles: articles,
      articlesList: [],
      loadNumber: 0,
      beyondBootStrap: false,
      savedSort: '',
      clickedSortButton: ''
    };
    this.testXHR = this.testXHR.bind(this);
    // this.state.savedSort =
  }

  loadMoreArticles() {
    // console.log(this.state.loadNumber);
    let newLoadNumber = this.state.loadNumber + 1;

    if (this.state.beyondBootStrap === false) {
      this.createArticleRows(newLoadNumber, this.state.articles);
    } else if (this.testXHR().length !== 0) {
      this.createArticleRows(newLoadNumber, this.testXHR());
    }

  }

  // Creates the rows for each article. Passing arrayOfArticles as an
  // argument makes the function more resuseble.
  createArticleRows(loadNumber, arrayOfArticles) {
    let articlesList = [];
    let newState = this.state;
    let end;

    let sortedLists = this.createSortedArticleLists(arrayOfArticles.slice(0, end));
    // if this.state.clickedSortButton !== '', then sort arrayOfArticles
    // based on sort
    // If they don't want a sort to continue to be applied when more artilces
    // are loaded, just remove the below for lines and move the above line
    // back to below the for loop.
    if (this.state.clickedSortButton === 'words-sort-button') arrayOfArticles = sortedLists[0];
    if (this.state.clickedSortButton === 'words-rev-button') arrayOfArticles = sortedLists[1];
    if (this.state.clickedSortButton === 'submit-sort-button') arrayOfArticles = sortedLists[2];
    if (this.state.clickedSortButton === 'submit-rev-button') arrayOfArticles = sortedLists[3];


    if (loadNumber * 10 < arrayOfArticles.length && this.state.beyondBootStrap === false) {
      end = loadNumber * 10
      newState['loadNumber'] = loadNumber + 1;
    } else if (this.state.beyondBootStrap === false) {
      end = arrayOfArticles.length;
      if (this.testXHR().length === 0) { // As in there aren't any "more-articles"
        document.getElementById('load-more').disabled = true; // Disable the button
      } else {
        newState['loadNumber'] = 1;
        newState['beyondBootStrap'] = true;
      }
    } else {
      end = arrayOfArticles.length;
      newState['loadNumber'] += 1;
    }
    // May need to extend above to set the display state for the load more button

    // Create row components for each articles
    for (let i = 0; i < end; i++) {
      let article = arrayOfArticles[i];
      articlesList.push(<ArticleRow key={i} article={article} />);
    }

    // Create lists of articles sorted and reverse-sorted by words and
    // submission.

    newState['articlesList'] = articlesList;
    newState['wordsSortedArticles'] = sortedLists[0];
    newState['wordsReverseSortedArticles'] = sortedLists[1];
    newState['submittedSortedArticles'] = sortedLists[2];
    newState['submittedReverseSortedArticles'] = sortedLists[3];
    this.setState(newState);
  }

  testXHR() {
    let xhttp = new XMLHttpRequest();
    let oldArticles = this.state.articles.slice(0);
    let newArticles = [];

    xhttp.onreadystatechange = function() {
      if (xhttp.readyState === 4 && xhttp.status === 200) {
        var obj = xhttp.response;

        if (obj !== "") {
          let newArticlesJSON = JSON.parse(obj);
          // This ternary helps when the number of more-articles isn't a
          // multiple of 10 (e.g. if there are 26 artiles, it will set the
          // end at 26 instead of 30);
          let end = this.state.loadNumber * 10 > newArticlesJSON.length ?
            newArticlesJSON.length : this.state.loadNumber * 10;

          // This sets the button to disabled if we've added all the articles
          // from more articles. beyondBootStrap is included to ensure that
          // the user is actually beyondBootStrap, otherwise there can be
          // a conflict on line 72 when we run testXHR to see if it more-
          // articles exist, causing that run to set the button to disabled.
          if (end >= newArticlesJSON.length && this.state.beyondBootStrap === true) {
            document.getElementById('load-more').disabled = true;
          }
          newArticles = oldArticles.concat(newArticlesJSON.slice(0, end));
        }
      }
    }.bind(this);
    xhttp.open("GET", "/more-articles.json", false);
    xhttp.send();

    return newArticles;
  }

  render() {
    console.log(this.state);
    return (
      <div className="App">
        <h1>Hello World!</h1>
        <div className="col-headers">
          <div id="article-header">Article</div>
          <div id="author-header">Author</div>
          <div id="words-header">Words
            <button id="words-sort-button" onClick={() => this.sortArticles('words', 'sort')}>Sort</button>
            <button id="words-rev-button" onClick={() => this.sortArticles('words', 'reverse')}>Reverse</button>
          </div>
          <div id="submitted-header">Submitted
            <button id="submit-sort-button" onClick={() => this.sortArticles('submitted', 'sort')}>Sort</button>
            <button id="submit-rev-button" onClick={() => this.sortArticles('submitted', 'reverse')}>Reverse</button>
          </div>
        </div>
        <ul>
          {this.state.articlesList}
        </ul>
        <button id="load-more" onClick={() => this.loadMoreArticles()}>Load More</button>
      </div>
    );
  }

  // Could just create these every time new articles are generated
  // Replace articles with articlesList
  createSortedArticleLists(arrayOfArticles) {
    let wordsArticlesObj = {};
    let submittedArticlesObj = {};
    arrayOfArticles.forEach(article => {
      wordsArticlesObj[article.words] = [];
      submittedArticlesObj[article.publish_at] = [];
    });
    arrayOfArticles.forEach(article => {
      wordsArticlesObj[article.words].push(article);
      submittedArticlesObj[article.publish_at].push(article);
    });

    // Create arrays of articles sorted and reverse-sorted by word count
    let wordsSortedArticles = [];
    let wordsArticlesObjKeys = Object.keys(wordsArticlesObj);
    wordsArticlesObjKeys.forEach(key => {
      wordsSortedArticles = wordsSortedArticles.concat(wordsArticlesObj[key]);
    });
    let wordsReverseSortedArticles = wordsSortedArticles.slice(0).reverse();

    // Create arrays of articles sorted and reverse-sorted by submission
    let submittedSortedArticles = [];
    let submittedArticlesObjKeys = Object.keys(submittedArticlesObj).sort();
    submittedArticlesObjKeys.forEach(key => {
      submittedSortedArticles = submittedSortedArticles.concat(submittedArticlesObj[key]);
    });
    let submittedReverseSortedArticles = submittedSortedArticles.slice(0).reverse();

    // Answer why we're returning an array instead of setting state
    return [wordsSortedArticles, wordsReverseSortedArticles, submittedSortedArticles,
      submittedReverseSortedArticles];
  }

  sortArticles(sortCategory, sortType) {
    let newState = this.state;

    if (this.state.clickedSortButton !== '') document.getElementById(this.state.clickedSortButton).style.backgroundColor = 'white';

    let newList;
    // Possibly refactor below to just be 4 if statements for the
    // different localStorage types
    if (sortCategory === 'words') {
      if (sortType === 'sort') {
        // Extract all four below into a function with relevant parameters
        newList = newState['wordsSortedArticles'];
        localStorage.setItem('savedSort', 'wordsSorted');
        document.getElementById('words-sort-button').style.backgroundColor = 'green';
        newState['clickedSortButton'] = 'words-sort-button';
      } else {
        newList = newState['wordsReverseSortedArticles'];
        localStorage.setItem('savedSort', 'wordsRevSorted');
        document.getElementById('words-rev-button').style.backgroundColor = 'green';
        newState['clickedSortButton'] = 'words-rev-button';
      }
    } else {
      if (sortType === 'sort') {
        newList = newState['submittedSortedArticles'];
        localStorage.setItem('savedSort', 'submitSorted');
        document.getElementById('submit-sort-button').style.backgroundColor = 'green';
        newState['clickedSortButton'] = 'submit-sort-button';
      } else {
        newList = newState['submittedReverseSortedArticles'];
        localStorage.setItem('savedSort', 'submitRevSorted');
        document.getElementById('submit-rev-button').style.backgroundColor = 'green';
        newState['clickedSortButton'] = 'submit-rev-button';
      }
    }

    let newArticlesList = [];
    for (let i = 0; i < newList.length; i++) {
      let article = newList[i];
      newArticlesList.push(<ArticleRow key={i} article={article} />);
    }
    newState['articlesList'] = newArticlesList;

    this.setState(newState);
  }

  componentDidMount() {
    let savedSort = localStorage.getItem('savedSort');

    if (this.state.loadNumber === 0) {
      if (savedSort === '' || savedSort === undefined) {
        this.createArticleRows(1, articles);
        this.setState({loadNumber: 1});
      } else {
        let arts = this.createSortedArticleLists(articles);

        let savedSortButtonLookUp = {
          wordsSorted: 'words-sort-button',
          wordsRevSorted: 'words-rev-button',
          submitSorted: 'submit-sort-button',
          submitRevSorted: 'submit-rev-button'
        }
        let savedSortButtonID = savedSortButtonLookUp[savedSort];
        document.getElementById(savedSortButtonID).style.backgroundColor = 'green';

        let sortedArts;
        if (savedSort === 'wordsSorted') sortedArts = arts[0];
        if (savedSort === 'wordsRevSorted') sortedArts = arts[1];
        if (savedSort === 'submitSorted') sortedArts = arts[2];
        if (savedSort === 'submitRevSorted') sortedArts = arts[3];

        this.createArticleRows(1, sortedArts);
        this.setState({loadNumber: 1, clickedSortButton: savedSortButtonID});
        // Possibly add set state for sort preference
      }
    }

  }

}

export default App;
