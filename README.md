adding and editing an opponent:
user can create a new opponent with an input form and input fields
all opponent data is stored in an excel sheet, .xlsx
(it's okay to have a blank value for an opponent's attribute)
here's what the data in the .xlsx sheet looks like:
(format) column name: what belongs in a cell
opponent: a string that's the opponent's username
their team: a string, the arena team they are using described in one word or a phrase
result: a string, what happened when I fought them? Either win, lose, or draw
weak to: a string, which team I used to win against them
strong against: a string, which team I used to lose or draw against them
notes: a string, can write extra notes about an opponent
trophies: text, how many trophies they have (supports decimals or labels)
team power: text, how much power their team has (supports decimals or labels)
(for cookie1 through cookie5 i will write an int in a string to show how many promotions thier cookie has)
cookie1: a string, their frontmost cookie
cookie2: a string, their 2nd cookie
cookie3: a string, their 3rd cookie
cookie4: a string, their 4th cookie
cookie5: a string, their rearmost cookie
treasure1: a string, their first treasure
treasure2: a string, their 2nd treasure
treasure3: a string, their 3rd treasure

excel spreadsheet:
a user can upload a spreadsheet to the website
a user can download a spreadsheet from the website
localStorage is used to store data between visits

exact column names, including spaces:
#	Column name	Expected value
1	opponent	Text
2	their team	Text
3	result	win / lose / draw
4	weak to	Text
5	strong against	Text
6	notes	Text
7	trophies	Text (including decimals or labels)
8	team power	Text (including decimals or labels)
9	cookie1	Text
10	cookie2	Text
11	cookie3	Text
12	cookie4	Text
13	cookie5	Text
14	treasure1	Text
15	treasure2	Text
16	treasure3	Text

searching for an opponent:
there's a form just like for adding/editing an opponent, but it functions like a searchbar
i type in a value, and the application automatically filters and searches for any opponent who has that value
make it so that the typed in value must be INSIDE or EQUAL TO the value we need to find, it doesn't have to be exact. example: 'aaa' is in aabaaaba so aabaaaba gets search included.

search values that should contain the value, not an exact match:
opponent
their team
weak to
strong against
notes

for treasure1, treasure2, and treasure3, it's different
if searching for "box", look for substring "box" in all 3 treasures, not just one
is a many to many mapping

search values that should exactly match the value:
result
trophies
team power

cookie1 through cookie5 are matched as team members rather than by slot:
every entered cookie must exactly match a different cookie in the opponent's
record, and opponent cookies in unsearched slots do not prevent a match.

search results/non search result cards should display these only:
opponent: a string that's the opponent's username
their team: a string, the arena team they are using described in one word or a phrase
result: a string, what happened when I fought them? Either win, lose, or draw
weak to: a string, which team I used to win against them
strong against: a string, which team I used to lose or draw against them
notes: a string, can write extra notes about an opponent

color scheme:
dark theme, black and blue, not too saturated
rounded buttons
google sans font?
as few different webpages as possible, only one webpage is ideal

file layout:
1 html file
1 css file
1 js file for searching opponents
1 js file for adding opponents
1 js file for everything else

application access:
the header password is "mallright" and stays in the browser's localStorage
so it remains filled after reloading the page
this is a client-side interface lock, not secure authentication; the password
is present in the application source and should not be used to protect sensitive data