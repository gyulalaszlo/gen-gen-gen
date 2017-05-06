# gen-gen-gen

The worlds most basic code generator with a Readme.

### Requirements

- nodeJs (most recent versions should be OK)
- skills with Handlebars
- editing a YAML file

```bash

# Clone the repo

git clone https://github.com/gyulalaszlo/gen-gen-gen.git
cd gen-gen-gen
```

If you dont want to mess with installing, link the package.

```bash
# Link to the npm repo

npm link .
```


### Ok, what does it do?

```bash
# Generate foo.h by concatenating 3 Handlebars templates

gen-gen-gen
    templates/header.handlebars
    templates/body.hb
    vendor/templates/footer.hb
    --output foo.h
    -D name=Foo
    
```

```bash
# Generate from a genfile (see genfiles.yaml.example )
gen-gen-gen -g genfile.yaml

```




