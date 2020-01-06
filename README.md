# React Component Library

## How to include this repository

### Step 1

add this to your package.json under dependencies

__For Production:__

```text
"dependencies": {
    "react-component-library": "git+ssh://git@bitbucket.org:simple-solution/react-component-library.git"
}
```

__For Staging:__

```text
"dependencies": {
    "react-component-library": "git+ssh://git@bitbucket.org/simple-solution/react-component-library.git#staging"
}
```

### Step 2

Run ```npm install``` in your terminal, in the project. This will install the package and you'll be able to find this in node_modules in "react-component-library".
