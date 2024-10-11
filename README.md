[![progress-banner](https://backend.codecrafters.io/progress/git/e019b1e4-2502-4ad7-a949-ffe1053efb1a)](https://app.codecrafters.io/users/codecrafters-bot?r=2qF)

This is a starting point for JavaScript solutions to the
["Build Your Own Git" Challenge](https://codecrafters.io/challenges/git).

In this challenge, you'll build a small Git implementation that's capable of
initializing a repository, creating commits and cloning a public repository.
Along the way we'll learn about the `.git` directory, Git objects (blobs,
commits, trees etc.), Git's transfer protocols and more.

**Note**: If you're viewing this repo on GitHub, head over to
[codecrafters.io](https://codecrafters.io) to try the challenge.

# Passing the first stage

The entry point for your Git implementation is in `app/main.js`. Study and
uncomment the relevant code, and push your changes to pass the first stage:

```sh
git commit -am "pass 1st stage" # any msg
git push origin master
```

That's all!

# Stage 2 & beyond

Note: This section is for stages 2 and beyond.

1. Ensure you have `node (21)` installed locally
1. Run `./your_program.sh` to run your Git implementation, which is implemented
   in `app/main.js`.
1. Commit your changes and run `git push origin master` to submit your solution
   to CodeCrafters. Test output will be streamed to your terminal.
