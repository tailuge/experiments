package exp

sealed trait MinOrMax { 
  def other(v:MinOrMax):MinOrMax = v match {
    case Min() =>Max()
    case Max() =>Min()
  }
  def unary_!():MinOrMax = other(this)
  def choose(x:Double,y:Double):Double  
  def upperBound():Double
}

case class Min extends MinOrMax {
    override def choose(x:Double,y:Double):Double = Math.min(x,y)
    override def upperBound():Double = Double.PositiveInfinity
}

case class Max extends MinOrMax {
    override def choose(x:Double,y:Double):Double = Math.max(x,y)
    override def upperBound():Double = Double.NegativeInfinity
}
