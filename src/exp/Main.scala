package exp

object Main extends Application {

  override def main(args: Array[String]): Unit = {
    
        val testNode = DevNode.make(1.0,List(1.0,2.0,3.0)) 
    
    println("result="+MiniMax.bestAtDepth(testNode,1,Min()))

  }

}