import {describe,it,expect,vi} from 'vitest';
import mongoose from 'mongoose';
import OwlModel from '../src/utils/model/model';
describe('OWL model operations',()=>{
 it('applies sessions, sorting, projection and lean through the OWL model',async()=>{
  const id='QueryOptions'+Date.now();const owl=OwlModel(id,{name:String});const native=mongoose.model(id);
  const query:any={populate:vi.fn(),select:vi.fn(),sort:vi.fn(),session:vi.fn(),lean:vi.fn(),then:(resolve:any)=>resolve([{name:'test'}])};for(const key of ['populate','select','sort','session','lean'])query[key].mockReturnValue(query);
  const spy=vi.spyOn(native,'find').mockReturnValue(query);
  const session={} as any;await owl.getByCoincidence({name:'test'},{select:'name',sort:{name:1},session,lean:true});
  expect(query.session).toHaveBeenCalledWith(session);expect(query.sort).toHaveBeenCalledWith({name:1});expect(query.select).toHaveBeenCalledWith('name');expect(query.lean).toHaveBeenCalledOnce();spy.mockRestore();
 });
 it('keeps conditional writes and index definitions inside OWL',async()=>{
  const id='Atomic'+Date.now();const owl=OwlModel(id,{stock:Number},[],[],{indexes:[{fields:{stock:1}}]});const native=mongoose.model(id);
  const spy=vi.spyOn(native,'findOneAndUpdate').mockReturnValue(Promise.resolve({stock:1}) as any);
  const filter={stock:{$gte:2}},update={$inc:{stock:-2}};await owl.updateWhere(filter,update,{runValidators:true});
  expect(spy).toHaveBeenCalledWith(filter,update,expect.objectContaining({new:true,runValidators:true}));
  expect(native.schema.indexes()[0][0]).toEqual({stock:1});expect(owl.fieldNames).toContain('stock');expect(owl.modelName).toBe(id);spy.mockRestore();
 });
});
