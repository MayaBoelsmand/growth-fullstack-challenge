# Exercises - Answers

### Notes on What I would Do Next

1. **Testing and `ParentProfileBackend` Refactoring**  
   I didn’t have enough time to update the tests or refactoring `ParentProfileBackend`. Those functions are now only used in the tests, and if I had more time, I’d turn `ParentProfileBackend` into something more like a mock repository. The way it was before, it worked more like a state manager, which made sense when storing just one record per payment method. Now, with versioning, it’s more about adding new records rather than updating or deleting, so the old helpers don’t fit quite as well anymore.

2. **Error Handling**  
   If I had more time, I’d also put in some proper error handling to make both the developer and user experience smoother. 

3. **Frontend Interface**  
   I’d also add proper interfaces to the frontend so the components can work with types as well. This would make everything flow better between the backend and frontend, and keep things easier to maintain.
