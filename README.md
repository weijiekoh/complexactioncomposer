# Complex Action Composer (CAC)

A simple tool to help developers execute tasks, log results, and compose said
tasks together.

I built this to manage deployments of multiple smart contracts for the Scalic
project. I needed a way to deploy and initialise multiple Solidity contracts
which were interconnected, and save their associated contract addresses,
transaction hashes, and other data.

## How it works

The core unit of CAC is an Action.

An Action is an abstract class which developers must extend for their own use
case. They must override the async `act()` function with whatever they need.

An Action accepts a `Config` and `Depenedencies`. These are arbitrary
Javascript objects.

The output of the `run()` function of an Action is `Output`. This is also an
arbitrary object. By default, it is saved to disk.

By default, an Action provides a Winston logger which logs to the console and
to a file.

The `Output` and the logs are saved to a workspace directory which the
developer must specify.

Actions use Typescript generics to keep things organised.

### Example

```typescript
interface AdderConfig {
    start: number;
    increment: number;
}

interface AdderOutput {
    result: number;
}

interface AdderDepedencies {
    // Adder has no dependencies, so this is just an empty interface.
}

class AdderAction extends Action<AdderConfig, AdderOutput, AdderDepedencies> {
    public async act(): Promise<AdderOutput> {
        // Just add start and increment.
        const result = this.config.start + this.config.increment

        this.logger.info(`Adding ${this.config.start} and ${this.config.increment} to get ${result}`)

        const output: AdderOutput = {
            result,
        }
        return output
    }
}

// An example Jest test of an Action that adds two numbers and returns the
// result:
describe('Action', () => {
    const tmpObj = tmp.dirSync()
    const tmpDirPath = tmpObj.name

    it('Adder', async () => {
        const config: AdderConfig = {
            start: 0,
            increment: 1,
        }
        const adderAction = new AdderAction(config, {}, tmpDirPath)

        const { filepath, output } = await adderAction.run()
        expect(output.result).toEqual(config.start + config.increment)
    })
})
```
