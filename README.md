# PlzHelp.me README
PlzHelp.Me is a Javascript full-stack application, which aims to links general contractors and handymen with clients who need work done on their homes, but lack the time or resources to research and contact the relevant people to do so.


##Overview of the files
The main folders are split up by client, public, and server. The primary server is located at server/server.js, and client/app.js holds the primary application logic.

| Client | Public | Server |
| :----- | :------ | :----- |
| Holds the assets and client-side app logic | Holds the distributable, which is sent to clients in production | Holds the server and database logic | 


##Details
The current tech stack of PlzHelp.me allows us to do the following:
  * Utilizes AngularJS to offer a swift, fluid menu to help find what you need.
  * Secured by Auth0 to keep users verified and keep their data safe.
  * Online chat service allows consumers to immediately contact an employee to assist them with their needs.
  * Uses ExpressJS and MySQL to quickly serve pages and stored data back to the user.


##Dev Setup
If you're running the application locally for the first time, make sure to run `npm install` in the root folder.

A Gruntfile is included. You can run `grunt` in the console to lint, test, and compile a distributable. You can use `grunt --force` to ignore potential issues with syntax or failed tests.

To run the local server, use `node server/server.js` from the root folder. Make sure you have a local MySQL server running, and that you create a database named `halp`.

To start up a local MySQL server:
  * Make sure you have MySQL globally installed: `npm install -g mysql` - You can confirm this by running `which mysql`.
  * In the root folder, run `mysql.server stop` to stop any running servers, then run `mysql.server start`.
  * In that same console, run `mysql -u root` to log in to the server.
  * Finally, if this is the first time you've run this app, make sure to run `CREATE DATABASE halp;` in the console to prepare the database. At this point, you should be ready to run Node!


##Other references

[The current PlzHelp.me website!](http://www.plzhelp.me/)