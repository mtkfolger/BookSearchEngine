import React from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from "../utils/mutation";
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';




const SavedBooks = () => {
  const [userData, setUserData] = useState({});
  const [deleteBook] = useMutation(REMOVE_BOOK);
  const userData = data?.me || {};

  if (!userData.username) {
    return (
      <h2>You must be logged in in order to see the requested page. 
        Click 'login' above to sign in to your account!
      </h2>
    );
  }

  //function that accepts the book's monogo _id value as a parameter, then deletes book from DB
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken(): null;
    
    if(!token) {
      return false;
    }

    try {
      await deleteBook ({
        variables: {bookId: bookId},
        update: cache => {
          const data = cache.readQuery ({ query: GET_ME});
          const userDataCache = data.me;
          const savedBooksCache = userDataCache.savedBooks;
          const updatedBookCache = savedBooksCache.filter((book) => book.bookId !== bookId);
          data.me.savedBooks = updatedBookCache;
          cache.writeQuery({ query: GET_ME , data: {data: { ...data.me.savedBooks}}})
        }
      });
      //if everything works, remove book id from local storage
      removeBookId(bookId);
    } catch (err) {
      console.log(err);
    }
  };

  //If we don't have any data yet, show message that data is loading
  if(loading)
 {
   return <h3>This page is loading ...</h3>;
 }
  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  { book.link ? <Card.Text><a href={book.link} target="_blank">More information on Google Books</a></Card.Text> : null}
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;