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
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: STR("WholePropertyPreference/预览"), style: UIBarButtonItemStyle.plain, block:  { (sender) -> Void in

            if let otherRequirement = self.form().otherRequirements {
                if CUTEContactChecker.checkShowContactForbiddenWarningAlert(otherRequirement) {
                    return
                }
            }
            self.submitTicket()
        })
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    //MARK: TableView

    override func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
        let field = self.formController.field(for: indexPath)

        if field?.key == "otherRequirements" {
            if let requirement = self.form().ticket.otherRequirements {
                cell.detailTextLabel?.text = requirement
            }
        }
    }


    // MARK: - Form Action

    func onOtherRequirements(_ sender:AnyObject) {
        if let cell = sender as? FXFormBaseCell {
            let value = cell.field.value as! String

            if CUTEContactChecker.checkShowContactForbiddenWarningAlert(value) {
                return
            }

            self.form().syncTicket({ (ticket:CUTETicket?) -> Void in
                if value.characters.count > 0 {
                    ticket!.otherRequirements = value
                }
                else {
                    ticket!.otherRequirements = nil
                }
            })
        }
    }

    func onSubmit(_ sender:AnyObject) {
        submitTicket()
    }

    // MARK: - Private

    func submitTicket() {

        if CUTEKeyboardStateListener.sharedInstance().isVisible {
            //will trigger save other requirement
            let field = self.formController.field(forKey: "otherRequirements")
            let indexPath = self.formController.indexPath(for: field)
            self.tableView.cellForRow(at: indexPath!)?.resignFirstResponder()
        }

        if let screenName = CUTETracker.sharedInstance().getScreenName(from: self) {
            CUTETracker.sharedInstance().trackEvent(withCategory: screenName, action: kEventActionPress, label: "preview-and-publish", value: nil)
            CUTETracker.sharedInstance().trackStayDuration(withCategory: KEventCategoryPostRentTicket, screenName: screenName)
        }

        SVProgressHUD.show()
        CUTERentTicketPublisher.sharedInstance().previewTicket(self.form().ticket, updateStatus: { (status:String?) -> Void in
            SVProgressHUD.show(withStatus: status)
            }, cancellationToken: nil).continue( { (task:BFTask!) -> AnyObject! in

                if task.error != nil {
                    SVProgressHUD.showErrorWithError(task.error)
                }
//                else if task.exception != nil {
//                    SVProgressHUD.showError(with: task.exception)
//                }
                else if task.isCancelled {
                    SVProgressHUD.showErrorWithCancellation()
                }
                else {
                    SVProgressHUD.dismiss()
                    CUTEDataManager.sharedInstance().saveRentTicket(self.form().ticket)

                    if let identifier = self.form().ticket.identifier {
                        if let url = CUTEPermissionChecker.URLWithPath("/wechat-poster/" + identifier) {
                            let controller = CUTERentTicketPreviewViewController()
                            controller.ticket = self.form().ticket
                            controller.url = url
                            controller.load(URLRequest(url:url))
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
