package exp

object MiniMax {

  def bestAtDepth(node: Node, depth: Int, sense: MinOrMax) : Double = depth match {
    case 0 => node.eval()
    case n => node.children().foldLeft(sense.upperBound())((x,y) => sense.choose(x,bestAtDepth(y,n-1,!sense)))
  }
  
}