//
//  CUTESurroundingListViewController.swift
//  currant
//
//  Created by Foster Yin on 10/15/15.
//  Copyright © 2015 BBTechgroup. All rights reserved.
//

import UIKit


@objc(CUTESurroundingListViewController)
class CUTESurroundingListViewController: UITableViewController, UISearchBarDelegate, UISearchDisplayDelegate {

    private var form:CUTESurroundingForm
    private var searchResultSurroundings:[CUTESurrounding] = []
    var postcodeIndex:String?
    internal var searchController:UISearchDisplayController?
    internal var searchBarBackground:UIView?

    // 实现隐藏“No Results” label 用的flag
    //http://stackoverflow.com/questions/11639257/how-do-i-cover-the-no-results-text-in-uisearchdisplaycontrollers-searchresult
    //http://stackoverflow.com/questions/22888016/uisearchdisplaycontroller-configure-no-results-view-not-to-overlap-tablefooter
    private var noSearchResult:Bool = true


    init(form:CUTESurroundingForm) {
        self.form = form
        super.init(style: UITableViewStyle.Plain)
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }


    override func viewDidLoad() {
        super.viewDidLoad()
        super.tableView.backgroundColor = UIColor(hex6: 0xeeeeee)
        super.tableView.separatorStyle = UITableViewCellSeparatorStyle.None
        super.tableView.allowsSelection = false
//        self.definesPresentationContext = true

        // Uncomment the following line to preserve selection between presentations
        // self.clearsSelectionOnViewWillAppear = false

        // Uncomment the following line to display an Edit button in the navigation bar for this view controller.
        // self.navigationItem.rightBarButtonItem = self.editButtonItem()

        self.title = STR("SurroundingList/周边")
        self.showBarButtonItems()

        //if default search don't add surrounding, user can add them
        if self.form.ticket.property.surroundings.count == 0 {
            dispatch_after(dispatch_time(DISPATCH_TIME_NOW, Int64(0.5 * Double(NSEC_PER_SEC))), dispatch_get_main_queue(), {
                SVProgressHUD.showInfoWithStatus(STR("SurroundingList/点击右上角“+”，添加周边的学校和地铁"))
            })
        }
    }

    func checkShowSurroundingAddTooltip() {

        let userDefaultKey = CUTE_USER_DEFAULT_TIP_SURROUNDING_ADD_DISPLAYED
        if !NSUserDefaults.standardUserDefaults().boolForKey(userDefaultKey)
        {

            let toolTips = CUTETooltipView(targetPoint: CGPointMake(self.view.frame.size.width - 23, 54), hostView: self.navigationController?.view, tooltipText: STR("SurroundingList/点此搜索添加学校或地铁"), arrowDirection: JDFTooltipViewArrowDirection.Up, width: 200)
            toolTips.show()

            do {
                //https://github.com/steipete/Aspects/issues/51
                let closure:((Void)->Void) = {  toolTips.hideAnimated(true) }
                let block: @convention(block) Void -> Void = closure
                let objectBlock = unsafeBitCast(block, AnyObject.self)

                try self.aspect_hookSelector("viewWillDisappear:", withOptions: AspectOptions(rawValue: AspectOptions.PositionBefore.rawValue | AspectOptions.OptionAutomaticRemoval.rawValue), usingBlock: objectBlock)
                try self.view.aspect_hookSelector("hitTest:withEvent:", withOptions: AspectOptions(rawValue: AspectOptions.PositionBefore.rawValue | AspectOptions.OptionAutomaticRemoval.rawValue), usingBlock: objectBlock)
            }
            catch let error as NSError {
                print(error)
            }

            toolTips.show()

            NSUserDefaults.standardUserDefaults().setBool(true, forKey: userDefaultKey)
        }

    }

    func showBarButtonItems() {
        self.navigationItem.rightBarButtonItem = UIBarButtonItem(barButtonSystemItem: UIBarButtonSystemItem.Add, block: { (sender) -> Void in

            if self.view.window != nil {
                let searchBar = UISearchBar(frame: CGRectMake(0, 20, self.view.frame.size.width, 44))
                searchBar.backgroundImage = UIImage()
                searchBar.tintColor = UIColor(hex6: 0xdd3f3d)
                searchBar.barTintColor = UIColor.clearColor()
                searchBar.backgroundColor = UIColor.clearColor()
                searchBar.delegate = self
                searchBar.placeholder = STR("SurroundingList/输入关键字搜索学校, 地铁...")
                self.searchController = UISearchDisplayController(searchBar: searchBar, contentsController: self)
                self.searchController?.delegate = self
                self.searchController?.searchResultsDelegate = self
                self.searchController?.searchResultsDataSource = self
                self.navigationController?.view.addSubview(self.searchController!.searchBar)
                self.searchController?.searchContentsController.extendedLayoutIncludesOpaqueBars = true
                self.searchController?.searchResultsTableView.contentInset = UIEdgeInsetsMake(searchBar.frame.size.height, 0, 0, 0);
                self.searchController?.searchResultsTableView.removeMargins()


                self.searchBarBackground = UIView(frame:CGRectMake(0, 0, self.view.frame.size.width, 64))
                self.searchBarBackground?.backgroundColor = UIColor(hex6: 0x333333)

                //Notice，模仿 UINavigationBar 加了两个辅助的view 实现背景色，
                let blurView = UIView(frame:self.searchBarBackground!.bounds)
                blurView.backgroundColor = UIColor(hex8:0xF7F7F780)
                let frontGroundView = UIView(frame: self.searchBarBackground!.frame)
                frontGroundView.backgroundColor = UIColor(hex6: 0x333333)
                frontGroundView.alpha = 0.85
                self.searchBarBackground?.addSubview(blurView)
                self.searchBarBackground?.addSubview(frontGroundView)

                self.navigationController?.view.addSubview(self.searchBarBackground!)
                self.navigationController?.view.addSubview(searchBar)
                self.navigationController?.setNavigationBarHidden(true, animated: false)
                self.searchController?.setActive(true, animated: true)
                self.searchController?.searchBar.becomeFirstResponder()
            }
        })

        checkShowSurroundingAddTooltip()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }

    // MARK: - Table view data source

    override func numberOfSectionsInTableView(tableView: UITableView) -> Int {
        // #warning Incomplete implementation, return the number of sections
        return 1
    }

    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {

        if self.searchController != nil {
            if self.searchController?.searchResultsTableView == tableView {
                if self.searchResultSurroundings.count == 0 {
                    noSearchResult = true
                    return 1
                }
                else {
                    noSearchResult = false
                    return self.searchResultSurroundings.count
                }
            }
            else {
                //TODO Strange searchController 
                return 0
            }
        }
        else {

            return (form.ticket.property.surroundings as! [CUTESurrounding]).count
        }
    }


    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        if self.searchController != nil {
            if self.searchController?.searchResultsTableView == tableView {

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
            else {
                let cell = UITableViewCell(style: UITableViewCellStyle.Default, reuseIdentifier: "madCell")
                cell.textLabel?.font = UIFont.systemFontOfSize(15)
                cell.textLabel?.textColor = UIColor(hex6: 0x666666)
                cell.removeMargins()
                return cell
            }
        }
        else {

            let cell = tableView.dequeueReusableCellWithIdentifier("surroundingReuseIdentifier")

            var surroundingCell:CUTESurroundingCell

            if cell is CUTESurroundingCell {
                surroundingCell = cell as! CUTESurroundingCell
            }
            else {
                surroundingCell = CUTESurroundingCell(style: UITableViewCellStyle.Default, reuseIdentifier: "surroundingReuseIdentifier")
                surroundingCell.typeButton.addTarget(self, action: "onTypeButtonPressed:", forControlEvents: UIControlEvents.TouchUpInside)
                surroundingCell.durationButton.addTarget(self, action: "onDurationButtonPressed:", forControlEvents: UIControlEvents.TouchUpInside)
                surroundingCell.removeButton.addTarget(self, action: "onRemoveButtonPressed:", forControlEvents: UIControlEvents.TouchUpInside)
                surroundingCell.removeButton.hitTestEdgeInsets = UIEdgeInsetsMake(-10, -10, -10, -10)
            }
            let surroundings = form.ticket.property.surroundings as! [CUTESurrounding]
            let surrounding = surroundings[indexPath.row]
            surroundingCell.nameLabel.text = surrounding.name
            surroundingCell.typeImageView.setImageWithURL(NSURL(string: surrounding.type.image)!)
            surroundingCell.typeButton.tag = indexPath.row
            surroundingCell.durationButton.tag = indexPath.row
            surroundingCell.removeButton.tag = indexPath.row


            var trafficTime = surrounding.trafficTimes?.filter({ (time:CUTETrafficTime) -> Bool in
                return time.isDefault
            }).first

            if trafficTime == nil {
                trafficTime = surrounding.trafficTimes?[0]
            }

            if (trafficTime != nil) {
                if trafficTime!.time != nil {
                    surroundingCell.typeButton.setTitle(trafficTime!.type!.value, forState: UIControlState.Normal)
                    surroundingCell.durationButton.setTitle("\(trafficTime!.time!.value) " + (trafficTime!.time!.unitForDisplay)!, forState: UIControlState.Normal)
                }
                surroundingCell.setNeedsLayout()
            }
            
            return surroundingCell
        }
    }

    override func tableView(tableView: UITableView, heightForRowAtIndexPath indexPath: NSIndexPath) -> CGFloat {
        if self.searchController?.searchResultsTableView == tableView {
            return 65
        }
        return 80;
    }

    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        if self.searchController?.searchResultsTableView == tableView {
            let surrounding = self.searchResultSurroundings[indexPath.row]
            let surroundings = form.ticket.property.surroundings as! [CUTESurrounding]
            if  surroundings.filter({ (surr:CUTESurrounding) -> Bool in
                return surr.identifier == surrounding.identifier
            }).count == 0 {
                SVProgressHUD.show()
                self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                    var array = Array(ticket.property.surroundings as! [CUTESurrounding])
                    array.insert(surrounding, atIndex: 0)
                    ticket.property.surroundings = array

                }).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                    self.searchController?.setActive(false, animated: true)
                    self.navigationController?.setNavigationBarHidden(false, animated: false)
                    self.searchController?.searchBar.removeFromSuperview()
                    self.searchController = nil
                    self.tableView.reloadData()

                    SVProgressHUD.dismiss()
                    return task
                })
            }
            else {
                tableView.deselectRowAtIndexPath(indexPath, animated: true)
                SVProgressHUD.showErrorWithStatus(STR("SurroundingList/已添加"))
            }
        }
    }

    func hideSearchBar() {
        self.searchController?.setActive(false, animated: true)
        self.navigationController?.setNavigationBarHidden(false, animated: false)

        UIView.animateWithDuration(0.4, animations: { () -> Void in
            self.searchController?.searchBar.alpha = 0
            self.searchBarBackground?.alpha = 0
            }, completion: { (stop:Bool) -> Void in
                self.searchController?.searchBar.removeFromSuperview()
                self.searchBarBackground?.removeFromSuperview()
                self.searchController = nil
        })
    }

    func searchBar(searchBar: UISearchBar, textDidChange searchText: String) {


    }

    func searchBarCancelButtonClicked(searchBar: UISearchBar) {
        self.hideSearchBar()
    }

    func searchBarSearchButtonClicked(searchBar: UISearchBar) {
        SVProgressHUD.show()
        CUTEGeoManager.sharedInstance.searchSurroundingsWithName(searchBar.text, latitude: nil, longitude: nil, city: nil, country: nil, propertyPostcodeIndex:self.postcodeIndex).continueWithBlock { (task:BFTask!) -> AnyObject! in
            self.searchResultSurroundings = task.result as! [CUTESurrounding]
            self.searchController?.searchResultsTableView.reloadData()
//            self.searchController?.searchResultsTableView.contentSize = CGSizeMake(CGRectGetWidth(self.searchController!.searchResultsTableView.bounds), CGFloat(self.searchResultSurroundings.count) * 65.0)
            SVProgressHUD.dismiss()
            return task
        }
    }

    func searchDisplayControllerDidBeginSearch(controller: UISearchDisplayController) {

    }

    func searchDisplayControllerDidEndSearch(controller: UISearchDisplayController) {

        if (self.searchController?.searchBar.superview != nil) {
            self.hideSearchBar()
        }

    }

    func searchDisplayController(controller: UISearchDisplayController, willShowSearchResultsTableView tableView: UITableView) {
        //clear the old tableview
        self.searchResultSurroundings = [] //clear last result
        tableView.reloadData()
    }


    func onTypeButtonPressed(sender:UIButton) {
        var surroundings = Array(form.ticket.property.surroundings as! [CUTESurrounding])
        let surr = surroundings[sender.tag]
        if (surr.trafficTimes != nil) {

            let modes = surr.trafficTimes!.map({ (time:CUTETrafficTime) -> String in
                return time.type!.value + " \(time.time!.value) " + time.time!.unitForDisplay
            })

            var defaultTimeIndex = 0

            for (index, time) in surr.trafficTimes!.enumerate() {
                if time.isDefault {
                    defaultTimeIndex = index
                    break
                }
            }

            ActionSheetStringPicker.showPickerWithTitle("", rows: modes, initialSelection: defaultTimeIndex, doneBlock: { (picker:ActionSheetStringPicker!, selectedIndex:Int, selectedValue:AnyObject!) -> Void in

                for time in surr.trafficTimes! {
                    time.isDefault = false
                }
                let time = surr.trafficTimes![selectedIndex]
                time.isDefault = true
                self.tableView.reloadData()
                }, cancelBlock: { (picker:ActionSheetStringPicker!) -> Void in
                    
                }, origin: sender)
        }
    }

    func onDurationButtonPressed(sender:UIButton) {
        var surroundings = Array(form.ticket.property.surroundings as! [CUTESurrounding])
        let surr = surroundings[sender.tag]
        if (surr.trafficTimes != nil) {
            var defaultTimeIndex = 0

            for (index, time) in surr.trafficTimes!.enumerate() {
                if time.isDefault {
                    defaultTimeIndex = index
                    break
                }
            }

            let defaultTime = surr.trafficTimes![defaultTimeIndex]
            let timeValue = defaultTime.time!.value
            let aroundValues = getAroundTime(timeValue).map({ (intValue:Int32) -> String in
                return "\(intValue)"
            })
            let timetValueIndex = aroundValues.indexOf("\(timeValue)")

            ActionSheetStringPicker.showPickerWithTitle("", rows: aroundValues, initialSelection:timetValueIndex!, doneBlock: { (picker:ActionSheetStringPicker!, selectedIndex:Int, selectedValue:AnyObject!) -> Void in
                if let value = Int32(selectedValue as! String) {

                    SVProgressHUD.show()
                    self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
                        let surr = (ticket.property.surroundings[sender.tag] as! CUTESurrounding)
                        var array = Array(surr.trafficTimes)

                        let oldTrafficTime = array[defaultTimeIndex]
                        let time = CUTETimePeriod(value: value, unit: "minute")
                        let newTrafficTime = CUTETrafficTime()
                        newTrafficTime.type = oldTrafficTime.type
                        newTrafficTime.isDefault = oldTrafficTime.isDefault
                        newTrafficTime.time = time
                        array[defaultTimeIndex] = newTrafficTime

                        //update traffic time just by assign a new array, because the listener listen the trafficTims attribute
                        surr.trafficTimes = array

                    }).continueWithBlock({ (task:BFTask!) -> AnyObject! in
                        self.tableView.reloadData()
                        SVProgressHUD.dismiss()
                        return task
                    })
                }
                }, cancelBlock: { (picker:ActionSheetStringPicker!) -> Void in
                    
                }, origin: sender)
        }

    }

    func onRemoveButtonPressed(sender:UIButton) {
        let index = sender.tag
        SVProgressHUD.show()
        self.form.syncTicketWithBlock({ (ticket:CUTETicket!) -> Void in
            var array = Array(ticket.property.surroundings as! [CUTESurrounding])
            array.removeAtIndex(index)
            ticket.property.surroundings = array
        }).continueWithBlock { (task:BFTask!) -> AnyObject! in
            self.tableView.reloadData()
            SVProgressHUD.dismiss()
            return task
        }
    }

    private func getAroundTime(timeValue:Int32) -> [Int32] {
        return [timeValue - 30,
            timeValue - 25,
            timeValue - 20,
            timeValue - 15,
            timeValue - 10,
            timeValue - 5,
            timeValue,
            timeValue + 5,
            timeValue + 10,
            timeValue + 15,
            timeValue + 20,
            timeValue + 25,
            timeValue + 30
            ].filter { (value:Int32) -> Bool in
            return value >= 0
        }
    }
}
