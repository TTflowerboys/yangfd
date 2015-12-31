//
//  CUTEWholePropertyPreferenceViewController.swift
//  currant
//
//  Created by Foster Yin on 12/29/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

@objc(CUTEWholePropertyPreferenceViewController)
class CUTEWholePropertyPreferenceViewController: CUTEFormViewController {

    func form() -> CUTEWholePropertyPreferenceForm {
        return self.formController.form as! CUTEWholePropertyPreferenceForm
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the

        self.title = STR("WholePropertyPreference/租客要求")
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: STR("WholePropertyPreference/预览"), style: UIBarButtonItemStyle.Plain, block:  { (sender) -> Void in

            //TODO add track duration
            SVProgressHUD.show()
            CUTERentTicketPublisher.sharedInstance().previewTicket(self.form().ticket, updateStatus: { (status:String!) -> Void in
                SVProgressHUD.showWithStatus(status)
                }, cancellationToken: nil).continueWithBlock( { (task:BFTask!) -> AnyObject! in

                    if task.error != nil {
                        SVProgressHUD.showErrorWithError(task.error)
                    }
                    else if task.exception != nil {
                        SVProgressHUD.showErrorWithException(task.exception)
                    }
                    else if task.cancelled {
                        SVProgressHUD.showErrorWithCancellation()
                    }
                    else {
                        SVProgressHUD.dismiss()
                        CUTEDataManager.sharedInstance().saveRentTicket(self.form().ticket)

                        let controller = CUTERentTicketPreviewViewController()
                        controller.ticket = self.form().ticket
                        controller.URL = CUTEPermissionChecker.URLWithPath("/wechat-poster/" + self.form().ticket.identifier)
                        controller.loadRequest(NSURLRequest(URL:controller.URL))
                        self.navigationController?.pushViewController(controller, animated: true)
                    }

                    return task
                })
        })
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    

    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
