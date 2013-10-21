package exp

trait Node {

  def eval() : Double;
  def children() : List[Node];
  
  override def toString = eval() + "," + children()
  
}