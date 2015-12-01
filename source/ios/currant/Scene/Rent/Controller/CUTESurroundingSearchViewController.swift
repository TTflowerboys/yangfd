//
//  CUTESurroundingSearchViewController.swift
//  currant
//
//  Created by Foster Yin on 12/1/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit

protocol CUTESurroundingSearchDelegate : NSObjectProtocol {

    func searchAddSurrounding(surrounding:CUTESurrounding)

}

class CUTESurroundingSearchViewController: UIViewController, UITableViewDataSource, UITableViewDelegate, UISearchBarDelegate {

    var searchBar:UISearchBar!
    weak var tableView:UITableView!
    var delegate:CUTESurroundingSearchDelegate?

    private var form:CUTESurroundingForm
    private var searchResultSurroundings:[CUTESurrounding] = []
    private var postcodeIndex:String
    private var searchCancellationTokenSource:BFCancellationTokenSource?

    // 实现隐藏“No Results” label 用的flag
    //http://stackoverflow.com/questions/11639257/how-do-i-cover-the-no-results-text-in-uisearchdisplaycontrollers-searchresult
    //http://stackoverflow.com/questions/22888016/uisearchdisplaycontroller-configure-no-results-view-not-to-overlap-tablefooter
    private var noSearchResult:Bool = true


    init(form:CUTESurroundingForm, postcodeIndex:String!) {
        self.form = form
        self.postcodeIndex = postcodeIndex
        super.init(nibName:nil, bundle:nil)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }


    override func loadView() {
        let size = UIScreen.mainScreen().bounds.size
        self.view = UIView(frame: CGRectMake(0, 0, size.width, size.height))

        let searchBar = UISearchBar(frame: CGRectMake(0, 20, size.width, 44))
        searchBar.backgroundImage = UIImage()
        searchBar.tintColor = UIColor(hex6: 0xdd3f3d)
        searchBar.barTintColor = UIColor.clearColor()
        searchBar.backgroundColor = UIColor.clearColor()
        searchBar.delegate = self
        searchBar.placeholder = STR("SurroundingList/输入关键字搜索学校, 地铁...")
        self.searchBar = searchBar

        let tableView = UITableView(frame: CGRectMake(0, 0, size.width, size.height), style: UITableViewStyle.Plain)
        tableView.delegate = self
        tableView.dataSource = self
        self.view.addSubview(tableView)
        
        self.tableView = tableView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        self.navigationItem.titleView = self.searchBar
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(title: STR("取消"), style: UIBarButtonItemStyle.Plain, block: { (sender:AnyObject!) -> Void in

            if self.searchCancellationTokenSource != nil {
                self.searchCancellationTokenSource!.cancel()
            }

            self.searchBar.resignFirstResponder()
            self.dismissViewControllerAnimated(true, completion: { () -> Void in

            })
        })

        // Do any additional setup after loading the view.
    }

    override func viewWillAppear(animated: Bool) {
        self.searchBar.becomeFirstResponder()
    }

    override func preferredStatusBarStyle() -> UIStatusBarStyle {
        return UIStatusBarStyle.LightContent
    }

    // MARK: - Table view data source

    func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        // #warning Incomplete implementation, return the number of sections
        return 1
    }

    func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        if self.searchResultSurroundings.count == 0 {
            noSearchResult = true
            return 1
        }
        else {
            noSearchResult = false
            return self.searchResultSurroundings.count
        }
    }


    func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {

        if noSearchResult == true {
            var cell = tableView.dequeueReusableCellWithIdentifier("cleanCell")
            if cell == nil {
                cell = UITableViewCell(style: UITableViewCellStyle.Default, reuseIdentifier: "reuseIdentifier")
                cell?.textLabel?.font = UIFont.systemFontOfSize(15)
                cell?.textLabel?.textColor = UIColor(hex6: 0x666666)
                cell?.removeMargins()
            }
            return cell!
        }
        else {
            var cell = tableView.dequeueReusableCellWithIdentifier("reuseIdentifier")
            if cell == nil {
                cell = UITableViewCell(style: UITableViewCellStyle.Default, reuseIdentifier: "reuseIdentifier")
                cell?.textLabel?.font = UIFont.systemFontOfSize(15)
                cell?.textLabel?.textColor = UIColor(hex6: 0x666666)
                cell?.removeMargins()
            }
            let surrounding = self.searchResultSurroundings[indexPath.row]
            let imageView = UIImageView()
            imageView.frame = CGRectMake(0, 0, 20, 20)
            imageView.contentMode = UIViewContentMode.Center
            imageView.setImageWithURL(NSURL(string: surrounding.type.image)!)

            cell?.accessoryView = imageView
            cell?.textLabel?.numberOfLines = 2
            cell?.textLabel?.lineBreakMode = NSLineBreakMode.ByWordWrapping
            cell?.textLabel?.text = surrounding.name
            return cell!
        }
    }

    func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        return 65
    }

    func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        if self.searchResultSurroundings.count > 0{
            let surrounding = self.searchResultSurroundings[indexPath.row]
            let surroundings = form.ticket.property.surroundings as! [CUTESurrounding]
            if  surroundings.filter({ (surr:CUTESurrounding) -> Bool in
                return surr.identifier == surrounding.identifier
            }).count == 0 {

                self.searchBar.resignFirstResponder()

                self.navigationController?.dismissViewControllerAnimated(true, completion: { () -> Void in
                    if let delegate = self.delegate {
                        delegate.searchAddSurrounding(surrounding)
                    }
                })
            }
            else {
                tableView.deselectRowAtIndexPath(indexPath, animated: true)
                SVProgressHUD.showErrorWithStatus(STR("SurroundingList/已添加"))
            }
        }
        else {
            tableView.deselectRowAtIndexPath(indexPath, animated: true)
        }
    }

    func scrollViewWillBeginDragging(scrollView: UIScrollView) {
        //dismiss keyboard
        self.searchBar.resignFirstResponder()
    }

    func searchBarSearchButtonClicked(searchBar: UISearchBar) {
        if self.searchCancellationTokenSource != nil {
            self.searchCancellationTokenSource!.cancel()
        }
        SVProgressHUD.show()
        self.searchCancellationTokenSource = BFCancellationTokenSource()
        CUTEGeoManager.sharedInstance.searchSurroundingsMainInfoWithName(searchBar.text, latitude: nil, longitude: nil, city: nil, country: nil, propertyPostcodeIndex:self.postcodeIndex, cancellationToken:self.searchCancellationTokenSource!.token).continueWithBlock { (task:BFTask!) -> AnyObject! in
            if task.error != nil {
                SVProgressHUD.showErrorWithError(task.error)
            }
            else if task.cancelled {
                SVProgressHUD.showErrorWithCancellation()
            }
            else if task.exception != nil {
                SVProgressHUD.showErrorWithException(task.exception)
            }
            else if let surroundings = task.result as? [CUTESurrounding] {
                self.searchResultSurroundings = surroundings
                self.tableView.reloadData()
                SVProgressHUD.dismiss()
            }
            return task
        }
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
