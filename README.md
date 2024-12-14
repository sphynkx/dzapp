Expample of simple SPA-application based on Django framework. See it on https://dzapp.sphynkx.org.ua

Features:
=====

* Posts created by authorized and approved users.
* Posts are dynamically adding to list. List is much of titles expanding by click, may be sorted by title, author, creation date.
* For every post it may to add comments that sets in branch.
* Comments may send any user that fill username, mail, homepage and captcha. Users add to DB and differs by username, mail, homepage.
* The mail, homepage check for correct format.
* Both posts and comments support some text formating, addition links, images, text files with size no more 100kb. Files embed in text and displays with some CSS-effects.
* Images are JPG, GIF, PNG only. Images with size more than 100kb will resize to 320x240.

TODOs:
====

* Add paging by 10 pages.
* Add post expand caching with redis.
