package exp

import org.scalatest._
import org.scalatest.matchers.ShouldMatchers

class TestSpec extends FlatSpec with ShouldMatchers {
  "Hello" should "have tests" in {
    true should be === true
  }
  
  "bestAtDepth 0" should "be eval of the node" in {
    val testNode = new DevNode(1.0)
    MiniMax.bestAtDepth(testNode,0,Max()) should be === 1.0
    MiniMax.bestAtDepth(testNode,0,Min()) should be === 1.0
  }

  "bestAtDepth 1" should "be min/max of the children" in {
    val testNode = DevNode.make(1.0,List(1.0,2.0,3.0)) 
    
    println("******")
    MiniMax.bestAtDepth(testNode,1,Min()) should be === 3.0
//    MiniMax.bestAtDepth(testNode,0,Min()) should be === 1.0
  }

}


