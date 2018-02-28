# Hi Quinn! Thanks for the help!

So, I need to know why `updateItems()` in line 234 will not work (this is al in the js file btw)

The list at the top of the map needs to filter whenever the user types something in the box. The items in the list are stored in an observable array.

What happens is, I have a normal array with all of the names of the places called `shownTitles`. you can disregard the variable `masterItems` Whenever something is typed, `shownTitles` is filtered (you can see that in the console). I then put that filtered array into the observable array `allItems`. I need the list to filter whenever `allItems` is updated. Its probably a subscription problem. Call me with questions!