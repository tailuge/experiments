package exp

import org.scalatest._
import org.scalatest.matchers.ShouldMatchers

class TestSpec extends FlatSpec with ShouldMatchers {
  "Hello" should "have tests" in {
    true should be === true
  }
  
  "bestAtDepth 0" should "be eval of the node" in {
    val testNode = new DevNode(1.0,Nil)
    MiniMax.bestAtDepth(testNode,0,Max()) should be === 1.0
  }
  
}


