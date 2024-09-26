`mr` is a small `git` wrapper for console geeks; let's see it in action:
```
$ mr TASK-42 from origin/release
Create new branch 'TASK-4444' from 'origin/release' [Y/n]? y
 > git fetch
 > git switch --guess --merge --create TASK-4444 origin/release
Switched to a new branch 'TASK-4444'
$ mr release
 > git switch --merge --guess release
$ mr TASK-42
 > git switch --merge --guess TASK-42

$ git commit -m "TASK-42 branch first commit msg"

$ mr TASK-42 to test
> git push --set-upstream origin TASK-42:TASK-42
  -o merge_request.create -o merge_request.target=master
  -o merge_request.title='TASK-42 branch first commit msg'
remote: View merge request for TASK-42:
remote:   https://gitlab.local/jonny64/mr-git-cli/-/merge_requests/1
 * [new branch]      TASK-42 -> TASK-42
> git switch test
> git merge origin/TASK-42
> npm test
> git push

$ mr TASK-42 to release
> git switch release
> git merge origin/TASK-42
> npm test
> git push
```
see https://github.com/jonny64/mr-git-cli/wiki for details
