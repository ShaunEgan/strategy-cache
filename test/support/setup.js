import { should, default as chai } from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import dirtyChai from 'dirty-chai'
import chaiInteger from 'chai-integer'

chai.use(chaiAsPromised)
chai.use(sinonChai)
chai.use(dirtyChai)
chai.use(chaiInteger)

should()
