
<p class="has-line-data" data-line-start="0" data-line-end="2">Adventure Capitalist Game<br>
This is a responsive web application that allows users to run their own virtual business empire. The game is built using React and Redux and was inspired by Adventure Capitalist.</p>
<p class="has-line-data" data-line-start="3" data-line-end="13">Table of Contents<br>
Demo<br>
Features<br>
Installation<br>
Technical Details<br>
Trade-offs<br>
Future Improvements<br>
Credits<br>
Demo<br>
A live demo of the game can be accessed at <a href="https://41future.github.io/adventure-capitalist/"></a></p>
<p class="has-line-data" data-line-start="14" data-line-end="16">Features<br>
This game offers the following features:</p>
<p class="has-line-data" data-line-start="17" data-line-end="23">Responsive design that works on desktop, tablet, and mobile devices.<br>
Multiple businesses that can be purchased and managed independently.<br>
Managers who can be hired to automate the running of businesses.<br>
A countdown and progress bar that indicate when businesses will be ready to produce income.<br>
Continuous progress even when the game is closed, thanks to caching of game state and calculation of earnings based on current and last played times.<br>
Option to buy upgrades for businesses to increase earnings.</p>
<p class="has-line-data" data-line-start="25" data-line-end="26">To run this project locally, you will need to have Node.js and Yarn installed on your computer. Follow these steps:</p>
<p class="has-line-data" data-line-start="27" data-line-end="31">Clone this repository to your local machine using git clone <a href="https://github.com/41FUTURE/adventure-capitalist.git">https://github.com/41FUTURE/adventure-capitalist.git</a><br>
Navigate to the project directory using cd adventure-capitalist<br>
Install the dependencies using yarn install<br>
Start the development server using yarn start.</p>
<p class="has-line-data" data-line-start="32" data-line-end="34">Technical Details<br>
This game uses React and Redux to manage the state and components of the application. Each business and manager has a corresponding entry in the store, and all logics rely on the store state. The countdown and progress bar are calculated using JavaScript’s Date object for accuracy.</p>
<p class="has-line-data" data-line-start="35" data-line-end="36">The game is front-end only, but a backend could be implemented to allow users to play on multiple devices without losing progress. Facebook login is integrated to provide users with a seamless experience.</p>
<p class="has-line-data" data-line-start="37" data-line-end="38">CSS is used to style the game and make it visually appealing, but additional graphics could be added to enhance the game further.</p>
<p class="has-line-data" data-line-start="39" data-line-end="41">Trade-offs<br>
One of the main trade-offs in this project is the lack of third-party UI or game engines. While these could have made the development process faster and easier, they may have limited the flexibility and customization options of the game.</p>
<p class="has-line-data" data-line-start="42" data-line-end="43">Another trade-off is the decision to implement only a front-end solution. While this allowed for a simpler and more lightweight game, it limits the user experience by not allowing users to save progress across devices without Facebook login.</p>
<p class="has-line-data" data-line-start="45" data-line-end="54">Future Improvements<br>
Some potential improvements to this game include:<br>
Facebook login and backend data storage so users can play on multiple devices without losing progress.<br>
Installation<br>
Adding more businesses and managers to provide users with a wider range of options.<br>
Implementing more upgrades to increase earnings for businesses.<br>
Enhancing the visuals of the game with additional graphics or animations.<br>
Adding a leaderboard or other social features to enhance competition and engagement.<br>
Adding a backend solution to allow for seamless cross-device gameplay without Facebook login.</p>
<p class="has-line-data" data-line-start="56" data-line-end="58">Credits<br>
This game was created as part of a coding challenge. It was built using React and Redux, and was inspired by the game Adventure Capitalist.</p>
