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
            self.submitTicket()
        })
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    //MARK: TableView

    override func tableView(tableView: UITableView, willDisplayCell cell: UITableViewCell, forRowAtIndexPath indexPath: NSIndexPath) {
        let field = self.formController.fieldForIndexPath(indexPath)

        if field.key == "otherRequirements" {
            if let requirement = self.form().ticket.otherRequirements {
                cell.detailTextLabel?.text = requirement
            }
        }
    }


    // MARK: - Form Action

    func onOtherRequirements(sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! String

            self.form().syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                if value.characters.count > 0 {
                    ticket.otherRequirements = value
                }
                else {
                    ticket.otherRequirements = nil
                }
            })
        }
    }

    func onSubmit(sender:AnyObject) {
        submitTicket()
    }

    // MARK: - Private

    func submitTicket() {

        if CUTEKeyboardStateListener.sharedInstance().visible {
            //will trigger save other requirement
            let field = self.formController.fieldForKey("otherRequirements")
            let indexPath = self.formController.indexPathForField(field)
            self.tableView.cellForRowAtIndexPath(indexPath)?.resignFirstResponder()
        }

        if let screenName = CUTETracker.sharedInstance().getScreenNameFromObject(self) {
            CUTETracker.sharedInstance().trackEventWithCategory(screenName, action: kEventActionPress, label: "preview-and-publish", value: nil)
            CUTETracker.sharedInstance().trackStayDurationWithCategory(KEventCategoryPostRentTicket, screenName: screenName)
        }

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

                    if let identifier = self.form().ticket.identifier {
                        if let url = CUTEPermissionChecker.URLWithPath("/wechat-poster/" + identifier) {
                            let controller = CUTERentTicketPreviewViewController()
                            controller.ticket = self.form().ticket
                            controller.URL = url
                            controller.loadRequest(NSURLRequest(URL:url))
                            self.navigationController?.pushViewController(controller, animated: true)
                        }
                    }
                }

                return task
            })
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
