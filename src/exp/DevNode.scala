package exp

class DevNode(eval:Double,children:List[Node]) extends Node {

  def this(eval:Double) = this(eval,List[DevNode]())
  def eval() = eval;
  def children() = children;
  
}

object DevNode {
  def make(eval:Double,childValues:List[Double]) = new DevNode(eval,childValues map (x=>new DevNode(x)))
}